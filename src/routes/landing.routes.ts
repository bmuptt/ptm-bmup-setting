import { Router } from 'express';
import LandingController from '../controllers/landing.controller';
import { validateLandingUpsertAnyMiddleware, handleLandingMulterError, validateLandingGetSectionMiddleware } from '../validation/landing.validation';
import { verifyCoreToken } from '../middleware/auth.middleware';
import { uploadAnyImages } from '../config/multer';
import { parseMultipartFormData } from '../middleware/form-data-parser.middleware';
import IconController from '../controllers/icon.controller';
import ActivityController from '../controllers/activity.controller';
import { validateActivityCreateMiddleware, validateActivityDeleteMiddleware, validateActivityDetailMiddleware, validateActivitySortMiddleware, validateActivityUpdateMiddleware } from '../validation/activity.validation';

const router = Router();
const landingController = new LandingController();
const iconController = new IconController();
const activityController = new ActivityController();

router.put(
  '/items',
  verifyCoreToken,
  uploadAnyImages(),
  parseMultipartFormData, // Add parser middleware here
  handleLandingMulterError,
  validateLandingUpsertAnyMiddleware,
  landingController.upsertItems.bind(landingController)
);

router.get(
  '/sections',
  landingController.getAllSections.bind(landingController)
);

router.get(
  '/sections/:page_key',
  validateLandingGetSectionMiddleware,
  landingController.getSection.bind(landingController)
);

router.get(
  '/icons',
  verifyCoreToken,
  iconController.getActiveIcons.bind(iconController)
);

router.get(
  '/activities',
  activityController.listActivities.bind(activityController)
);

router.get(
  '/activities/:id',
  verifyCoreToken,
  validateActivityDetailMiddleware,
  activityController.detailActivity.bind(activityController)
);

router.post(
  '/activities',
  verifyCoreToken,
  validateActivityCreateMiddleware,
  activityController.createActivity.bind(activityController)
);

router.put(
  '/activities/sort',
  verifyCoreToken,
  validateActivitySortMiddleware,
  activityController.sortActivities.bind(activityController)
);

router.put(
  '/activities/:id',
  verifyCoreToken,
  validateActivityUpdateMiddleware,
  activityController.updateActivity.bind(activityController)
);

router.delete(
  '/activities/:id',
  verifyCoreToken,
  validateActivityDeleteMiddleware,
  activityController.deleteActivity.bind(activityController)
);

export default router;
