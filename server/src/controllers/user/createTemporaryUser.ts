import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a temporary user (no password, email, etc.)
 * POST /api/users/temporary
 */
export async function createTemporaryUser(req: Request, res: Response): Promise<void> {
    try {
        // Create a temporary user with minimal data
        const tempUser = await prisma.user.create({
            data: {
                // All fields are optional - user is created with just defaults
                isConfirmed: false,
            },
            select: {
                id: true,
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
    } catch (error) {
        console.error('Error creating temporary user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create temporary user',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
