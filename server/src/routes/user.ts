import { Router } from 'express';

import * as UserController from '../controllers/user';

import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/temporary', UserController.createTemporaryUser);

router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, UserController.updateProfile);

router.post('/change-password', authenticate, UserController.changePassword);

export default router;
