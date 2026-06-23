import { Router, Request, Response } from 'express';
import { runEventJobs } from '../services/cron.service';
import { processFollowUpAutomation } from '../services/follow-up.cron';
import { ApiResponse } from '../shared/response/apiResponse';

const router = Router();

function guardSecret(req: Request, res: Response): boolean {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || token !== process.env.JOBS_SECRET) {
    res.status(401).json(ApiResponse.error('Unauthorised', 401));
    return false;
  }
  return true;
}

// Called by Cloud Scheduler every minute
router.post('/events', async (req: Request, res: Response) => {
  if (!guardSecret(req, res)) return;
  try {
    await runEventJobs();
    res.json(ApiResponse.ok('Event jobs completed', null));
  } catch {
    res.status(500).json(ApiResponse.error('Event jobs failed', 500));
  }
});

// Called by Cloud Scheduler every hour
router.post('/follow-ups', async (req: Request, res: Response) => {
  if (!guardSecret(req, res)) return;
  try {
    await processFollowUpAutomation();
    res.json(ApiResponse.ok('Follow-up jobs completed', null));
  } catch {
    res.status(500).json(ApiResponse.error('Follow-up jobs failed', 500));
  }
});

export default router;
