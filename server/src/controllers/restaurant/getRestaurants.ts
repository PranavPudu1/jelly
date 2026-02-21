import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Types ───────────────────────────────────────────────────────────────────

interface ContextSignals {
    hardConstraints: Record<string, boolean>; // maps directly to `attributes` keys
    mealPeriod?: 'servesLunch' | 'servesDinner' | 'servesBreakfast' | 'servesBrunch';
    softSignals: string[];
    occasion: string;
}

// ─── In-memory caches (simple TTL maps) ──────────────────────────────────────

const CONTEXT_PARSE_TTL_MS  = 30 * 60 * 1000; // 30 min
const RERANK_TTL_MS         = 20 * 60 * 1000; // 20 min

const contextParseCache = new Map<string, { signals: ContextSignals; ts: number }>();
const rerankCache       = new Map<string, { scores: Record<string, number>; ts: number }>();

function cachePut<T>(map: Map<string, { data: T; ts: number }>, key: string, value: T, ttl: number) {
    map.set(key, { data: value, ts: Date.now() + ttl });
}

function cacheGet<T>(map: Map<string, { data: T; ts: number }>, key: string): T | null {
    const entry = map.get(key);
    if (!entry) return null;
    if (Date.now() > entry.ts) { map.delete(key); return null; }
    return entry.data;
}

// ─── Haversine + bounding box ────────────────────────────────────────────────

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateBoundingBox(lat: number, long: number, radiusMeters: number) {
    const latDiff  = radiusMeters / 111000;
    const longDiff = radiusMeters / (111000 * Math.cos((lat * Math.PI) / 180));
    return {
        minLat: lat - latDiff, maxLat: lat + latDiff,
        minLong: long - longDiff, maxLong: long + longDiff,
    };
}

// ─── Preference scoring (unchanged) ──────────────────────────────────────────

function calculateScore(
    restaurant: any,
    distance: number,
    radiusMeters: number,
    preferences?: { foodQuality?: number; ambiance?: number; proximity?: number; price?: number; reviews?: number },
): { score: number; breakdown: any | null } {
    if (!preferences) return { score: 0, breakdown: null };

    const { foodQuality = 0, ambiance = 0, proximity = 0, price: priceWeight = 0, reviews: reviewsWeight = 0 } = preferences;

    const foodQualityValue      = restaurant.foodQualityScore ?? restaurant.rating * 2;
    const foodQualityNormalized = foodQualityValue / 10;
    const ambianceScore         = restaurant.ambianceScore || 0;
    const proximityScore        = 1 - distance / radiusMeters;
    const priceValue            = restaurant.price.length;
    const priceScore            = 1 - (priceValue - 1) / 3;
    const reviewCount           = restaurant.reviews?.length || 0;
    const reviewScore           = Math.min(reviewCount / 50, 1);

    const weighted = {
        foodQuality: foodQualityNormalized * foodQuality,
        ambiance:    ambianceScore * ambiance,
        proximity:   proximityScore * proximity,
        price:       priceScore * priceWeight,
        reviews:     reviewScore * reviewsWeight,
    };

    const score = weighted.foodQuality + weighted.ambiance + weighted.proximity + weighted.price + weighted.reviews;
    return { score, breakdown: { raw: { foodQualityNormalized, ambianceScore, proximityScore, priceScore, reviewScore }, weighted, totalScore: score } };
}

function isAmbianceHighPriority(preferences?: Record<string, number>): boolean {
    if (!preferences) return false;
    const top2 = Object.entries(preferences).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
    return top2.includes('ambiance');
}

// ─── Context parsing via GPT-4o ──────────────────────────────────────────────

async function parseContext(contextText: string): Promise<ContextSignals> {
    const cached = cacheGet<ContextSignals>(contextParseCache as any, contextText);
    if (cached) return cached;

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0,
        max_tokens: 300,
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: `You parse meal context for a restaurant recommendation app.
Return ONLY valid JSON with this exact shape:
{
  "hardConstraints": {
    "outdoorSeating": boolean | null,
    "goodForGroups": boolean | null,
    "goodForChildren": boolean | null,
    "reservable": boolean | null,
    "liveMusic": boolean | null,
    "servesCocktails": boolean | null,
    "servesWine": boolean | null,
    "servesBeer": boolean | null,
    "servesVegetarianFood": boolean | null,
    "delivery": boolean | null,
    "takeout": boolean | null
  },
  "mealPeriod": "servesLunch" | "servesDinner" | "servesBreakfast" | "servesBrunch" | null,
  "softSignals": ["string", ...],
  "occasion": "string"
}
Rules:
- Only set a hardConstraint to true if the user EXPLICITLY requires it. Leave as null if not mentioned.
- softSignals: 3–6 short descriptors capturing the vibe (e.g. "family-friendly", "quiet", "casual", "romantic").
- occasion: one brief phrase (e.g. "family lunch", "date night", "quick solo lunch").`,
            },
            {
                role: 'user',
                content: `User context: "${contextText}"`,
            },
        ],
    });

    const raw = completion.choices[0].message.content || '{}';
    const parsed = JSON.parse(raw) as ContextSignals;

    // Strip null constraint entries — only keep explicit true values
    if (parsed.hardConstraints) {
        parsed.hardConstraints = Object.fromEntries(
            Object.entries(parsed.hardConstraints).filter(([, v]) => v === true),
        );
    }

    cachePut<ContextSignals>(contextParseCache as any, contextText, parsed, CONTEXT_PARSE_TTL_MS);
    return parsed;
}

// ─── Hard-constraint penalty scoring ─────────────────────────────────────────

/**
 * Returns a penalty multiplier 0–1 based on how many hard constraints the
 * restaurant fails. Missing constraints (attribute not in DB) are not penalised.
 */
function hardConstraintScore(restaurant: any, signals: ContextSignals): number {
    const attrs = (restaurant.attributes as Record<string, boolean>) || {};
    const constraints = { ...signals.hardConstraints };

    // Add meal-period constraint
    if (signals.mealPeriod) {
        constraints[signals.mealPeriod] = true;
    }

    const required = Object.keys(constraints);
    if (required.length === 0) return 1;

    let penalties = 0;
    for (const key of required) {
        // Only penalise if the field exists in our data and is explicitly false
        if (key in attrs && attrs[key] === false) {
            penalties++;
        }
    }

    // Each failed constraint removes 40% from the score, floored at 0.1
    return Math.max(0.1, 1 - penalties * 0.4);
}

// ─── GPT-4o batch re-ranker ───────────────────────────────────────────────────

async function reRankWithContext(
    restaurants: any[],
    contextText: string,
    signals: ContextSignals,
): Promise<Record<string, number>> {
    if (restaurants.length === 0) return {};

    // Cache key: sorted restaurant IDs + context
    const cacheKey = `${restaurants.map((r) => r.id).sort().join('|')}__${contextText}`;
    const cached = cacheGet<Record<string, number>>(rerankCache as any, cacheKey);
    if (cached) {
        console.log('[context-rerank] cache hit');
        return cached;
    }

    // Build compact restaurant summaries for the prompt
    const summaries = restaurants.map((r) => {
        const topReviews = (r.reviews || [])
            .slice(0, 3)
            .map((rv: any) => rv.review?.slice(0, 150))
            .filter(Boolean)
            .join(' | ');

        const trueAttrs = Object.entries((r.attributes as Record<string, boolean>) || {})
            .filter(([, v]) => v === true)
            .map(([k]) => k)
            .join(', ');

        const cuisine = (r.tags || [])
            .filter((t: any) => t.tagType?.value === 'cuisine')
            .map((t: any) => t.value)
            .join(', ');

        return `ID:${r.id} | ${r.name} | ${r.price} | ${cuisine || 'unknown cuisine'} | attrs:[${trueAttrs}] | reviews:"${topReviews}"`;
    });

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0,
        max_tokens: 600,
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: `You are ranking restaurants for a specific user situation.
Return ONLY valid JSON: { "scores": { "<restaurantId>": <0-10>, ... } }
Score 0 = terrible match, 10 = perfect match.
Consider: atmosphere described in reviews, venue attributes, cuisine, price, suitability for the occasion.
Be strict — a restaurant with zero outdoor seating should score low for someone who needs it.`,
            },
            {
                role: 'user',
                content: `User situation: "${contextText}"
Vibe they want: ${signals.softSignals.join(', ')}
Occasion: ${signals.occasion}

Restaurants to score:
${summaries.join('\n')}`,
            },
        ],
    });

    const raw = completion.choices[0].message.content || '{"scores":{}}';
    const result = JSON.parse(raw) as { scores: Record<string, number> };
    const scores = result.scores || {};

    cachePut<Record<string, number>>(rerankCache as any, cacheKey, scores, RERANK_TTL_MS);
    console.log(`[context-rerank] scored ${Object.keys(scores).length} restaurants for: "${contextText}"`);
    return scores;
}

// ─── Transform to app-ready format (unchanged) ───────────────────────────────

function transformRestaurant(restaurant: any, distance: number, preferences?: Record<string, number>) {
    const allImages = restaurant.images.map((image: any) => ({ id: image.id, url: image.url, tags: image.tags }));

    let heroImage = '';
    if (isAmbianceHighPriority(preferences)) {
        const ambianceImages = restaurant.images.filter((image: any) =>
            image.tags?.some((tag: any) => tag.value.toLowerCase() === 'ambiance'),
        );
        heroImage = ambianceImages[0]?.url || allImages[0]?.url || '';
    } else {
        heroImage = allImages[0]?.url || '';
    }

    const ambientImages     = allImages.slice(1, 4).map((img: any) => img.url);
    const menuImages        = restaurant.menu.flatMap((m: any) => m.images.map((img: any) => img.url)).slice(0, 5);
    const popularDishPhotos = menuImages.length > 0 ? menuImages : allImages.slice(0, 5).map((img: any) => img.url);
    const cuisineTags       = restaurant.tags.filter((t: any) => t.tagType?.value === 'cuisine').map((t: any) => t.value);

    const ambianceKeywords = ['ambiance', 'atmosphere', 'decor', 'vibe', 'aesthetic', 'cozy', 'elegant', 'modern', 'rustic', 'romantic'];
    let topReview = null;
    if (isAmbianceHighPriority(preferences)) {
        const ambianceReview = restaurant.reviews.find((rv: any) => {
            const text = (rv.review || '').toLowerCase();
            return rv.tags?.some((t: any) => ambianceKeywords.some((k) => t.value.toLowerCase().includes(k))) ||
                ambianceKeywords.some((k) => text.includes(k));
        });
        const selected = ambianceReview || restaurant.reviews[0];
        topReview = selected ? { author: selected.postedBy || 'Anonymous', rating: selected.rating, quote: selected.review } : null;
    } else {
        topReview = restaurant.reviews[0]
            ? { author: restaurant.reviews[0].postedBy || 'Anonymous', rating: restaurant.reviews[0].rating, quote: restaurant.reviews[0].review }
            : null;
    }

    const socialMedia = {
        instagram: restaurant.socialMedia.find((s: any) => s.source === 'instagram')?.url || null,
        tiktok:    restaurant.socialMedia.find((s: any) => s.source === 'tiktok')?.url || null,
    };

    return {
        id: restaurant.id,
        name: restaurant.name,
        distance: Math.round(distance),
        price: restaurant.price,
        rating: restaurant.rating,
        heroImage,
        ambientImages,
        popularDishPhotos,
        menu: restaurant.menu.map((m: any) => ({ id: m.id, images: m.images.map((i: any) => i.url), tags: m.tags.map((t: any) => t.value) })),
        topReview,
        cuisine: cuisineTags,
        socialMedia,
        address: restaurant.address,
        phoneNumber: restaurant.phoneNumber,
        lat: restaurant.lat,
        long: restaurant.long,
        mapLink: restaurant.mapLink,
        attributes: restaurant.attributes || {},
        ...(restaurant.score !== undefined && { score: restaurant.score }),
    };
}

// ─── Main handler ─────────────────────────────────────────────────────────────

/**
 * GET /api/restaurants
 * Query params: lat, long, radius, price, minRating, types, dietaryRestrictions,
 *               sortBy, preferences (JSON), page, pageSize, context (free text)
 */
export async function getRestaurants(req: Request, res: Response): Promise<void> {
    try {
        const {
            lat, long, radius = '5000', price, minRating, types,
            dietaryRestrictions, sortBy = 'distance', preferences,
            page = '1', pageSize = '10',
            context, // NEW: free-text meal context
        } = req.query;

        if (!lat || !long) {
            res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
            return;
        }

        const latitude      = parseFloat(lat as string);
        const longitude     = parseFloat(long as string);
        const radiusMeters  = parseFloat(radius as string);
        const pageNum       = parseInt(page as string);
        const pageSizeNum   = parseInt(pageSize as string);

        const priceFilters    = price ? (Array.isArray(price) ? price : [price]) : undefined;
        const typeFilters     = types ? (Array.isArray(types) ? types : [types]) : undefined;
        const dietaryFilters  = dietaryRestrictions ? (Array.isArray(dietaryRestrictions) ? dietaryRestrictions : [dietaryRestrictions]) : undefined;
        const userPreferences = preferences ? JSON.parse(preferences as string) : undefined;
        const contextText     = context ? (context as string).trim() : undefined;

        // ── 1. Database query ────────────────────────────────────────────────

        const { minLat, maxLat, minLong, maxLong } = calculateBoundingBox(latitude, longitude, radiusMeters);

        const where: any = { lat: { gte: minLat, lte: maxLat }, long: { gte: minLong, lte: maxLong } };
        if (priceFilters?.length) where.price = { in: priceFilters };
        if (minRating) where.rating = { gte: parseFloat(minRating as string) };
        if (typeFilters?.length) where.tags = { some: { value: { in: typeFilters } } };

        const restaurants = await prisma.restaurant.findMany({
            where,
            include: {
                images:     { orderBy: { rating: 'desc' }, include: { tags: true } },
                reviews:    { orderBy: { rating: 'desc' }, include: { images: true, tags: true } },
                menu:       { include: { images: true, tags: true } },
                socialMedia: true,
                tags:       { include: { tagType: true } },
            },
        });

        // ── 2. Distance filter ───────────────────────────────────────────────

        let candidates = restaurants
            .map((r) => ({ ...r, distance: calculateDistance(latitude, longitude, r.lat, r.long) }))
            .filter((r) => {
                if (r.distance > radiusMeters) return false;
                if (dietaryFilters?.length) {
                    const hasDiet = r.tags.some((t) =>
                        dietaryFilters.some((f) => t.value.toLowerCase().includes((f as string).toLowerCase())),
                    );
                    if (!hasDiet) return false;
                }
                return true;
            });

        // ── 3. Context signals + hard-constraint pre-scoring ─────────────────

        let contextSignals: ContextSignals | null = null;

        if (contextText) {
            try {
                contextSignals = await parseContext(contextText);
                console.log(`[context] parsed signals:`, JSON.stringify(contextSignals));

                // Apply hard-constraint multiplier before main sort
                candidates = candidates.map((r) => ({
                    ...r,
                    constraintScore: hardConstraintScore(r, contextSignals!),
                }));
            } catch (err) {
                console.error('[context] parse failed, continuing without context:', err);
            }
        }

        // ── 4. Primary sort ──────────────────────────────────────────────────

        if (sortBy === 'custom' && userPreferences) {
            candidates = candidates
                .map((r) => {
                    const { score } = calculateScore(r, r.distance, radiusMeters, userPreferences);
                    return { ...r, prefScore: score };
                })
                .sort((a: any, b: any) => b.prefScore - a.prefScore);
        } else if (sortBy === 'rating') {
            candidates.sort((a, b) => b.rating - a.rating);
        } else {
            candidates.sort((a, b) => a.distance - b.distance);
        }

        // ── 5. GPT-4o context re-ranking (top 20 shortlist, first page only) ─

        if (contextSignals && contextText && pageNum === 1) {
            const shortlist = candidates.slice(0, 20);

            try {
                const contextScores = await reRankWithContext(shortlist, contextText, contextSignals);

                // Blend: 50% existing sort signal, 50% context relevance
                // constraintScore is a hard multiplier applied on top
                candidates = candidates.map((r: any, idx: number) => {
                    const normalizedRank     = 1 - idx / Math.max(candidates.length - 1, 1);
                    const contextScore       = (contextScores[r.id] ?? 5) / 10; // default 5/10 if not in shortlist
                    const constraintMult     = (r as any).constraintScore ?? 1;
                    const blendedScore       = (normalizedRank * 0.4 + contextScore * 0.6) * constraintMult;
                    return { ...r, score: blendedScore };
                });

                candidates.sort((a: any, b: any) => b.score - a.score);
                console.log(`[context] re-ranked ${shortlist.length} restaurants`);
            } catch (err) {
                console.error('[context] re-rank failed, using primary sort:', err);
            }
        } else if (contextSignals && pageNum > 1) {
            // On subsequent pages apply only the hard-constraint multiplier (no extra LLM call)
            candidates = candidates.map((r: any) => ({
                ...r,
                score: ((r as any).constraintScore ?? 1),
            }));
            candidates.sort((a: any, b: any) => b.score - a.score);
        }

        // ── 6. Paginate ───────────────────────────────────────────────────────

        const totalCount   = candidates.length;
        const totalPages   = Math.ceil(totalCount / pageSizeNum);
        const paginated    = candidates.slice((pageNum - 1) * pageSizeNum, pageNum * pageSizeNum);
        const transformed  = paginated.map((r) => transformRestaurant(r, r.distance, userPreferences));

        res.status(200).json({
            success: true,
            data: transformed,
            pagination: {
                page: pageNum, pageSize: pageSizeNum, totalCount, totalPages,
                hasNextPage: pageNum < totalPages, hasPreviousPage: pageNum > 1,
            },
        });
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch restaurants',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
