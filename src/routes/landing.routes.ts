import { Router } from 'express';
import LandingController from '../controllers/landing.controller';
import { validateLandingUpsertAnyMiddleware, handleLandingMulterError, validateLandingGetSectionMiddleware } from '../validation/landing.validation';
import { verifyCoreToken } from '../middleware/auth.middleware';
import { uploadAnyImages } from '../config/multer';
import { parseMultipartFormData } from '../middleware/form-data-parser.middleware';

const router = Router();
const landingController = new LandingController();

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

export default router;
