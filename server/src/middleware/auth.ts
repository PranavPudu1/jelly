import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthRequest, JWTPayload } from '../types.d';

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user info to request
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Authentication required. No token provided.',
            });
            return;
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

        // Attach user info to request
        req.user = decoded;

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
            return;
        }

        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Token expired',
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Authentication error',
        });
    }
}

/**
 * Generate JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const jwtExpiration = process.env.JWT_EXPIRATION || '7d';

    return jwt.sign(payload, jwtSecret, {
        expiresIn: jwtExpiration,
    });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        return jwt.verify(token, jwtSecret) as JWTPayload;
    } catch (error) {
        return null;
    }
}
