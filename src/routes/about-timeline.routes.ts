import { Router } from 'express';
import AboutTimelineController from '../controllers/about-timeline.controller';
import { verifyCoreToken } from '../middleware/auth.middleware';
import {
  validateAboutTimelineCreateMiddleware,
  validateAboutTimelineDeleteMiddleware,
  validateAboutTimelineDetailMiddleware,
  validateAboutTimelineListQuery,
  validateAboutTimelineUpdateMiddleware,
} from '../validation/about-timeline.validation';

const router = Router();
const aboutTimelineController = new AboutTimelineController();

router.get(
  '/landing',
  aboutTimelineController.listAboutTimelinesLanding.bind(aboutTimelineController)
);

router.get(
  '/',
  verifyCoreToken,
  validateAboutTimelineListQuery,
  aboutTimelineController.listAboutTimelines.bind(aboutTimelineController)
);

router.get(
  '/:id',
  verifyCoreToken,
  validateAboutTimelineDetailMiddleware,
  aboutTimelineController.detailAboutTimeline.bind(aboutTimelineController)
);

router.post(
  '/',
  verifyCoreToken,
  validateAboutTimelineCreateMiddleware,
  aboutTimelineController.createAboutTimeline.bind(aboutTimelineController)
);

router.put(
  '/:id',
  verifyCoreToken,
  validateAboutTimelineUpdateMiddleware,
  aboutTimelineController.updateAboutTimeline.bind(aboutTimelineController)
);

router.delete(
  '/:id',
  verifyCoreToken,
  validateAboutTimelineDeleteMiddleware,
  aboutTimelineController.deleteAboutTimeline.bind(aboutTimelineController)
);

export default router;
