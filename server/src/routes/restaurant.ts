import { Router } from 'express';
import * as RestaurantController from '../controllers/restaurant';

const router = Router();

router.get('/', RestaurantController.getRestaurants);
router.get('/:id', RestaurantController.getById);

export default router;
