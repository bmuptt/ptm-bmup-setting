import { Router } from 'express';
import BlogPostController from '../controllers/blog-post.controller';
import { verifyCoreToken } from '../middleware/auth.middleware';
import { imageUpload } from '../config/multer';
import {
  validateBlogPostCmsListQuery,
  validateBlogPostCreateMiddleware,
  validateBlogPostDeleteMiddleware,
  validateBlogPostDetailMiddleware,
  validateBlogPostLandingListQuery,
  validateBlogPostLandingFeaturedQuery,
  validateBlogPostLandingSlugMiddleware,
  validateBlogPostStatusMiddleware,
  validateBlogPostUpdateMiddleware,
  handleBlogPostMulterError,
} from '../validation/blog-post.validation';

const router = Router();
const blogPostController = new BlogPostController();

router.get(
  '/landing',
  validateBlogPostLandingListQuery,
  blogPostController.listBlogPostsLanding.bind(blogPostController)
);

router.get(
  '/landing/featured',
  validateBlogPostLandingFeaturedQuery,
  blogPostController.listBlogPostsFeaturedLanding.bind(blogPostController)
);

router.get(
  '/landing/:slug',
  validateBlogPostLandingSlugMiddleware,
  blogPostController.detailBlogPostLanding.bind(blogPostController)
);

router.get(
  '/',
  verifyCoreToken,
  validateBlogPostCmsListQuery,
  blogPostController.listBlogPostsCms.bind(blogPostController)
);

router.get(
  '/:id',
  verifyCoreToken,
  validateBlogPostDetailMiddleware,
  blogPostController.detailBlogPostCms.bind(blogPostController)
);

router.post(
  '/',
  verifyCoreToken,
  imageUpload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'og_image', maxCount: 1 },
  ]),
  handleBlogPostMulterError,
  validateBlogPostCreateMiddleware,
  blogPostController.createBlogPost.bind(blogPostController)
);

router.put(
  '/:id/publish',
  verifyCoreToken,
  validateBlogPostStatusMiddleware,
  blogPostController.publishBlogPost.bind(blogPostController)
);

router.put(
  '/:id/unpublish',
  verifyCoreToken,
  validateBlogPostStatusMiddleware,
  blogPostController.unpublishBlogPost.bind(blogPostController)
);

router.put(
  '/:id',
  verifyCoreToken,
  imageUpload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'og_image', maxCount: 1 },
  ]),
  handleBlogPostMulterError,
  validateBlogPostUpdateMiddleware,
  blogPostController.updateBlogPost.bind(blogPostController)
);

router.delete(
  '/:id',
  verifyCoreToken,
  validateBlogPostDeleteMiddleware,
  blogPostController.deleteBlogPost.bind(blogPostController)
);

export default router;
