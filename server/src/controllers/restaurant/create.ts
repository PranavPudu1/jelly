import { Request, Response } from 'express';
import { prisma } from '../../config/database';

/**
 * Create a new restaurant
 */
export async function create(req: Request, res: Response): Promise<void> {
    try {
        const {
            name,
            rating,
            lat,
            long,
            address,
            mapLink,
            price,
            phoneNumber,
            sourceId,
            source,
        } = req.body;

        // Validate required fields
        if (!name || rating === undefined || !lat || !long || !address || !price || !phoneNumber) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields',
            });
            return;
        }

        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                rating,
                lat,
                long,
                address,
                mapLink,
                price,
                phoneNumber,
                sourceId,
                source,
            },
            include: {
                tags: true,
                images: true,
                reviews: true,
                menu: true,
                socialMedia: true,
            },
        });

        res.status(201).json({
            success: true,
            data: restaurant,
            message: 'Restaurant created successfully',
        });
    }
    catch (error) {
        console.error('Error creating restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create restaurant',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
