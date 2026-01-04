import { NextFunction, Request, Response } from 'express';
import { serializeData } from '../helper/serialization.helper';
import blogPostService from '../services/blog-post.service';
import {
  BlogPostCmsListQuery,
  BlogPostCreatePayload,
  BlogPostLandingFeaturedQuery,
  BlogPostLandingListQuery,
  BlogPostUpdatePayload,
} from '../model';
import { Prisma } from '@prisma/client';

export default class BlogPostController {
  async listBlogPostsLanding(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as BlogPostLandingListQuery;
      const result = await blogPostService.listBlogPostsLanding(query);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async listBlogPostsFeaturedLanding(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as BlogPostLandingFeaturedQuery;
      const result = await blogPostService.listBlogPostsFeaturedLanding(query);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async detailBlogPostLanding(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = res.locals.blogPostSlug as string;
      const result = await blogPostService.detailBlogPostLanding(slug);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async listBlogPostsCms(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as BlogPostCmsListQuery;
      const result = await blogPostService.listBlogPostsCms(query);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async detailBlogPostCms(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.blogPostId as bigint;
      const result = await blogPostService.detailBlogPostCms(id);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async createBlogPost(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body as unknown as BlogPostCreatePayload;
      const userId = req.user?.id;
      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      const result = await blogPostService.createBlogPost(payload, userId, files);
      res.status(201).json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async updateBlogPost(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.blogPostId as bigint;
      const payload = req.body as unknown as BlogPostUpdatePayload;
      const userId = req.user?.id;
      const existing = res.locals.blogPostExisting as Prisma.BlogPostGetPayload<{}>;
      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      const result = await blogPostService.updateBlogPost(id, payload, userId, existing, files);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async deleteBlogPost(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.blogPostId as bigint;
      const result = await blogPostService.deleteBlogPost(id);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async publishBlogPost(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.blogPostId as bigint;
      const existing = res.locals.blogPostExisting as Prisma.BlogPostGetPayload<{}>;
      const userId = req.user?.id;
      const result = await blogPostService.publishBlogPost(id, userId, existing);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async unpublishBlogPost(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.blogPostId as bigint;
      const userId = req.user?.id;
      const result = await blogPostService.unpublishBlogPost(id, userId);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }
}
