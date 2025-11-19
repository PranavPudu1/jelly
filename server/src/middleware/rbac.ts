import { Response, NextFunction } from 'express';
import type { AuthRequest, UserRole } from '../types.d';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if authenticated user has required role(s)
 */
export function authorize(...allowedRoles: UserRole[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        // Check if user is authenticated
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        // Check if user has required role
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions. Required role(s): ' + allowedRoles.join(', '),
            });
            return;
        }

        next();
    };
}

/**
 * Admin-only middleware
 * Shorthand for authorize(UserRole.ADMIN)
 */
export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
        return;
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({
            success: false,
            message: 'Admin access required',
        });
        return;
    }

    next();
}

/**
 * Owner or Admin middleware
 * Allows both owners and admins
 */
export function ownerOrAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
        return;
    }

    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
        res.status(403).json({
            success: false,
            message: 'Owner or Admin access required',
        });
        return;
    }

    next();
}
