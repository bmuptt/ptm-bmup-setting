import { Router } from 'express';
import GalleryItemController from '../controllers/gallery-item.controller';
import { verifyCoreToken } from '../middleware/auth.middleware';
import { uploadSingle } from '../config/multer';
import {
  handleGalleryItemMulterError,
  validateGalleryItemCreateMiddleware,
  validateGalleryItemDeleteMiddleware,
  validateGalleryItemDetailMiddleware,
  validateGalleryItemListQuery,
  validateGalleryItemSortMiddleware,
  validateGalleryItemUpdateMiddleware,
} from '../validation/gallery-item.validation';

const router = Router();
const galleryItemController = new GalleryItemController();

router.get('/landing', galleryItemController.listGalleryItemsLanding.bind(galleryItemController));

router.get(
  '/',
  verifyCoreToken,
  validateGalleryItemListQuery,
  galleryItemController.listGalleryItemsCms.bind(galleryItemController)
);

router.get(
  '/:id',
  verifyCoreToken,
  validateGalleryItemDetailMiddleware,
  galleryItemController.detailGalleryItem.bind(galleryItemController)
);

router.post(
  '/',
  verifyCoreToken,
  uploadSingle('image'),
  handleGalleryItemMulterError,
  validateGalleryItemCreateMiddleware,
  galleryItemController.createGalleryItem.bind(galleryItemController)
);

router.put(
  '/sort',
  verifyCoreToken,
  validateGalleryItemSortMiddleware,
  galleryItemController.sortGalleryItems.bind(galleryItemController)
);

router.put(
  '/:id',
  verifyCoreToken,
  uploadSingle('image'),
  handleGalleryItemMulterError,
  validateGalleryItemUpdateMiddleware,
  galleryItemController.updateGalleryItem.bind(galleryItemController)
);

router.delete(
  '/:id',
  verifyCoreToken,
  validateGalleryItemDeleteMiddleware,
  galleryItemController.deleteGalleryItem.bind(galleryItemController)
);

export default router;
