import { Router } from 'express';
import {
	getActivities,
	getRecentActivities,
	getActivityStats,
} from '../controllers/activity-log.controller';

const router = Router();

router.get('/', getActivities);
router.get('/recent', getRecentActivities);
router.get('/stats', getActivityStats);

export default router;

