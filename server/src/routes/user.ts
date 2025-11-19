import { Router } from 'express';
import * as UserController from '../controllers/user';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/rbac';

const router = Router();

// Public routes (no authentication required)
// POST /api/users/register - Register a new user
router.post('/register', UserController.register);

// POST /api/users/login - User login
router.post('/login', UserController.login);

// Protected routes (authentication required)
// GET /api/users/profile - Get current user profile
router.get('/profile', authenticate, UserController.getProfile);

// PUT /api/users/profile - Update current user profile
router.put('/profile', authenticate, UserController.updateProfile);

// POST /api/users/change-password - Change user password
router.post('/change-password', authenticate, UserController.changePassword);

// Admin-only routes
// GET /api/users - Get all users (admin only)
router.get('/', authenticate, adminOnly, UserController.getAllUsers);

// GET /api/users/:id - Get user by ID (admin only)
router.get('/:id', authenticate, adminOnly, UserController.getUserById);

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', authenticate, adminOnly, UserController.updateUser);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', authenticate, adminOnly, UserController.deleteUser);

export default router;
