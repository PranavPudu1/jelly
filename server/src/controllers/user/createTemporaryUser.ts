import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a temporary user (no password, email, etc.)
 * POST /api/users/temporary
 * Body: { deviceId?: string }
 */
export async function createTemporaryUser(req: Request, res: Response): Promise<void> {
    try {
        const { deviceId } = req.body;

        // Check if a user with this deviceId already exists
        if (deviceId) {
            const existingUser = await prisma.user.findUnique({
                where: { deviceId },
                select: {
                    id: true,
                    deviceId: true,
                    dateAdded: true,
                    dateUpdated: true,
                    isConfirmed: true,
                },
            });

            if (existingUser) {
                // Return existing user instead of creating a new one
                res.status(200).json({
                    success: true,
                    message: 'Existing temporary user found',
                    data: {
                        user: existingUser,
                    },
                });
                return;
            }
        }

        // Create a temporary user with minimal data
        const tempUser = await prisma.user.create({
            data: {
                deviceId: deviceId || null,
                isConfirmed: false,
            },
            select: {
                id: true,
                deviceId: true,
                dateAdded: true,
                dateUpdated: true,
                isConfirmed: true,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Temporary user created successfully',
            data: {
                user: tempUser,
            },
        });
    }
    catch (error) {
        console.error('Error creating temporary user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create temporary user',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
