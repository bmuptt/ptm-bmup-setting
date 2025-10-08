import { Router } from 'express';
import CoreController from '../controllers/core.controller';
import { uploadSingle } from '../config/multer';
import { validateCoreUpdateMiddleware, handleMulterError } from '../validation/core.validation';
import { verifyCoreToken } from '../middleware/auth.middleware';

const router = Router();
const coreController = new CoreController();

// Core routes
router.get('/', coreController.getCoreData.bind(coreController)); // No auth required for detail
router.put('/', verifyCoreToken, uploadSingle('logo'), handleMulterError, validateCoreUpdateMiddleware, coreController.updateCoreData.bind(coreController)); // Auth required for update

export default router;
