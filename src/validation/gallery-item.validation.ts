import { z } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { ResponseError } from '../config/response-error';
import galleryItemRepository from '../repository/gallery-item.repository';
import { GalleryItemCreatePayload, GalleryItemUpdatePayload } from '../model';
import { MulterError } from 'multer';

const bigIntIdSchema = z.union([
  z.bigint().refine((v) => v >= BigInt(0), { message: 'Invalid id' }),
  z.number().int().nonnegative().transform((v) => BigInt(v)),
  z.string().trim().regex(/^\d+$/, 'Invalid id').transform((v) => BigInt(v)),
]);

const isPublishedQuerySchema = z.union([
  z.boolean(),
  z.number().int().transform((v) => {
    if (v === 1) return true;
    if (v === 0) return false;
    throw new Error('The is_published is invalid!');
  }),
  z.string().trim().transform((val) => {
    if (val === 'true' || val === '1') return true;
    if (val === 'false' || val === '0') return false;
    throw new Error('The is_published is invalid!');
  }),
]);

export const galleryItemListQuerySchema = z.object({
  is_published: isPublishedQuerySchema.optional(),
});

export const galleryItemCreateSchema = z.object({
  title: z.string().min(1, 'The title is required!').max(255, 'The title is too long!'),
  is_published: z.union([z.boolean(), z.string().transform((val) => val === 'true')]).optional(),
});

export const galleryItemUpdateSchema = galleryItemCreateSchema.extend({
  status_file: z
    .string()
    .trim()
    .refine((val) => val === '0' || val === '1', { message: 'The status_file must be 0 or 1!' }),
});

export const galleryItemIdParamSchema = z.object({
  id: bigIntIdSchema,
});

export const galleryItemSortSchema = z.object({
  ids: z.array(bigIntIdSchema).min(1, 'The ids is required!'),
});

export const validateGalleryItemListQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedQuery = galleryItemListQuerySchema.parse(req.query);
    res.locals.galleryItemListQuery = validatedQuery;
    Object.assign(req.query, validatedQuery);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid query parameters'] });
  }
};

export const validateGalleryItemCreateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = galleryItemCreateSchema.parse(req.body) as GalleryItemCreatePayload;
    if (!req.file) {
      return res.status(400).json({ errors: ['The image is required!'] });
    }
    req.body = payload;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateGalleryItemUpdateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawStatusFile = (req.body as unknown as Record<string, unknown>).status_file;
    if (rawStatusFile === undefined || rawStatusFile === null || String(rawStatusFile).trim() === '') {
      return res.status(400).json({ errors: ['The status_file is required!'] });
    }
    const idParsed = galleryItemIdParamSchema.parse({ id: req.params.id }).id;
    const payload = galleryItemUpdateSchema.parse(req.body) as GalleryItemUpdatePayload;
    if (payload.status_file === '1' && !req.file) {
      return res.status(400).json({ errors: ['The image is required!'] });
    }

    const existing = await galleryItemRepository.findById(idParsed);
    if (!existing) {
      return next(new ResponseError(404, 'Gallery item not found'));
    }

    res.locals.galleryItemId = idParsed;
    res.locals.galleryItemExisting = existing;
    req.body = payload;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const handleGalleryItemMulterError = (err: unknown, req: Request, res: Response, next: NextFunction) => {
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

export const validateGalleryItemDeleteMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = galleryItemIdParamSchema.parse({ id: req.params.id }).id;
    const existing = await galleryItemRepository.findById(idParsed);
    if (!existing) {
      return next(new ResponseError(404, 'Gallery item not found'));
    }
    res.locals.galleryItemId = idParsed;
    res.locals.galleryItemExisting = existing;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateGalleryItemDetailMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = galleryItemIdParamSchema.parse({ id: req.params.id }).id;
    res.locals.galleryItemId = idParsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateGalleryItemSortMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = galleryItemSortSchema.parse(req.body);
    const ids = parsed.ids;

    const unique = new Set(ids.map((id) => id.toString()));
    if (unique.size !== ids.length) {
      return res.status(400).json({ errors: ['The ids must be unique!'] });
    }

    const foundCount = await galleryItemRepository.countByIds(ids);
    if (foundCount !== ids.length) {
      return res.status(400).json({ errors: ['Some gallery items were not found!'] });
    }

    res.locals.galleryItemSortIds = ids;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};
