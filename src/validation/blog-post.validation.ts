import { z } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { ResponseError } from '../config/response-error';
import blogPostRepository from '../repository/blog-post.repository';
import { BlogPostCreatePayload, BlogPostUpdatePayload } from '../model';
import { MulterError } from 'multer';

const blogPostStatusSchema = z.enum(['draft', 'published', 'not_published']);

const bigIntIdSchema = z.union([
  z.bigint().refine((v) => v >= BigInt(0), { message: 'Invalid id' }),
  z.number().int().nonnegative().transform((v) => BigInt(v)),
  z.string().trim().regex(/^\d+$/, 'Invalid id').transform((v) => BigInt(v)),
]);

const booleanQuerySchema = z.union([
  z.boolean(),
  z.number().int().transform((v) => {
    if (v === 1) return true;
    if (v === 0) return false;
    throw new Error('The is_featured is invalid!');
  }),
  z.string().trim().transform((val) => {
    if (val === 'true' || val === '1') return true;
    if (val === 'false' || val === '0') return false;
    throw new Error('The is_featured is invalid!');
  }),
]);

const nullableString = (maxLength?: number) => {
  const base = z.string().trim();
  const schema = maxLength ? base.max(maxLength) : base;
  return z.union([schema, z.null()]);
};

export const blogPostCreateSchema = z.object({
  title: z.string().trim().min(1, 'The title is required!').max(255),
  excerpt: nullableString().optional(),
  content: z.string().trim().min(1, 'The content is required!'),
  cover_image_url: nullableString().optional(),
  status: blogPostStatusSchema.optional(),
  is_featured: booleanQuerySchema.optional(),
  meta_title: nullableString(255).optional(),
  meta_description: nullableString(320).optional(),
  og_image_url: nullableString().optional(),
});

export const blogPostUpdateSchema = blogPostCreateSchema.partial().extend({
  status_file_cover: z.enum(['0', '1']),
  status_file_og_image: z.enum(['0', '1']),
});

const blogPostIdParamSchema = z.object({
  id: bigIntIdSchema,
});

const blogPostSlugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Invalid slug')
    .max(200, 'Invalid slug')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug'),
});

const numberQuery = z.union([
  z.number().int().nonnegative(),
  z.string().trim().regex(/^\d+$/, 'Invalid number').transform((v) => Number(v)),
]);

export const blogPostCmsListQuerySchema = z.object({
  page: numberQuery.optional(),
  limit: numberQuery.optional(),
  search: z.string().trim().max(255).optional(),
  status: blogPostStatusSchema.optional(),
  is_featured: booleanQuerySchema.optional(),
  order_by: z.enum(['published_at', 'created_at', 'updated_at', 'title']).optional(),
  order_dir: z.enum(['asc', 'desc']).optional(),
});

export const blogPostLandingListQuerySchema = z.object({
  page: numberQuery.optional(),
  limit: numberQuery.optional(),
});

export const blogPostLandingFeaturedQuerySchema = z.object({
  limit: numberQuery.optional(),
});

export const validateBlogPostCmsListQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedQuery = blogPostCmsListQuerySchema.parse(req.query);
    Object.assign(req.query, validatedQuery);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid query parameters'] });
  }
};

export const validateBlogPostLandingListQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedQuery = blogPostLandingListQuerySchema.parse(req.query);
    Object.assign(req.query, validatedQuery);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid query parameters'] });
  }
};

export const validateBlogPostLandingFeaturedQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedQuery = blogPostLandingFeaturedQuerySchema.parse(req.query);
    Object.assign(req.query, validatedQuery);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid query parameters'] });
  }
};

export const validateBlogPostCreateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = blogPostCreateSchema.parse(req.body) as BlogPostCreatePayload;
    req.body = payload;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateBlogPostUpdateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawStatusCover = (req.body as unknown as Record<string, unknown>).status_file_cover;
    if (rawStatusCover === undefined || rawStatusCover === null || String(rawStatusCover).trim() === '') {
      return res.status(400).json({ errors: ['The status_file_cover is required!'] });
    }

    const rawStatusOg = (req.body as unknown as Record<string, unknown>).status_file_og_image;
    if (rawStatusOg === undefined || rawStatusOg === null || String(rawStatusOg).trim() === '') {
      return res.status(400).json({ errors: ['The status_file_og_image is required!'] });
    }

    const idParsed = blogPostIdParamSchema.parse({ id: req.params.id }).id;
    const existing = await blogPostRepository.findById(idParsed);
    if (!existing) {
      return next(new ResponseError(404, 'Blog post not found'));
    }

    const payload = blogPostUpdateSchema.parse(req.body) as BlogPostUpdatePayload;

    res.locals.blogPostId = idParsed;
    res.locals.blogPostExisting = existing;
    req.body = payload;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateBlogPostDeleteMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = blogPostIdParamSchema.parse({ id: req.params.id }).id;
    const existing = await blogPostRepository.findById(idParsed);
    if (!existing) {
      return next(new ResponseError(404, 'Blog post not found'));
    }
    res.locals.blogPostId = idParsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateBlogPostStatusMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = blogPostIdParamSchema.parse({ id: req.params.id }).id;
    const existing = await blogPostRepository.findById(idParsed);
    if (!existing) {
      return next(new ResponseError(404, 'Blog post not found'));
    }
    res.locals.blogPostId = idParsed;
    res.locals.blogPostExisting = existing;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateBlogPostDetailMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = blogPostIdParamSchema.parse({ id: req.params.id }).id;
    res.locals.blogPostId = idParsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateBlogPostLandingSlugMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slugParsed = blogPostSlugParamSchema.parse({ slug: req.params.slug }).slug;
    res.locals.blogPostSlug = slugParsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const handleBlogPostMulterError = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    if (err instanceof ResponseError) {
      return next(err);
    }

    if (err instanceof MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ errors: ['File too large!'] });
      }
      return res.status(400).json({ errors: [err.message] });
    }

    if ((err as { message?: string }).message === 'Only image files are allowed!') {
      return res.status(400).json({ errors: ['Only image files are allowed!'] });
    }

    return next(err as Error);
  }
  next();
};
