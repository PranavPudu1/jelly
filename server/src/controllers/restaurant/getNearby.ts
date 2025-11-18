import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Get restaurants near a location
 */
export async function getNearby(req: Request, res: Response): Promise<void> {
    try {
        const { lat, long, radius = 5000 } = req.query;

        if (!lat || !long) {
            res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required',
            });
            return;
        }

        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(long as string);
        const radiusMeters = parseFloat(radius as string);

        // Simple distance calculation (for precise geo queries, consider using PostGIS)
        const restaurants = await prisma.$queryRaw`
            SELECT *,
            (6371000 * acos(
                cos(radians(${latitude})) *
                cos(radians(lat)) *
                cos(radians(long) - radians(${longitude})) +
                sin(radians(${latitude})) *
                sin(radians(lat))
            )) AS distance
            FROM restaurants
            HAVING distance < ${radiusMeters}
            ORDER BY distance
        `;

        res.status(200).json({
            success: true,
            data: restaurants,
        });
    }
    catch (error) {
        console.error('Error fetching nearby restaurants:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch nearby restaurants',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
