import { z } from 'zod';
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { LandingFormDataBody, LandingUpsertGroup, LandingItemInput } from '../model';
import { ResponseError } from '../config/response-error';
import { MulterError } from 'multer';

export const landingItemInputSchema = z.object({
  key: z.string().min(1),
  type: z.string().min(1).max(30).optional().nullable(),
  title: z.string().min(1).max(255).optional().nullable(),
  content: z.string().min(1).optional().nullable(),
  image_url: z.string().max(512).optional().nullable(),
  // Allow file object in image field (handled by service)
  image: z.any().optional(),
  button_label: z.string().min(1).max(100).optional().nullable(),
  button_url: z.string().max(512).optional().nullable(),
  published: z.union([z.boolean(), z.string().transform(val => val === 'true')]),
  status_image: z.enum(['0', '1']).optional(),
});

export const landingUpsertSchema = z.object({
  page_key: z.enum(['home', 'about']),
  items: z.array(landingItemInputSchema).min(1),
});

export function validateLandingUpsert(data: unknown): z.infer<typeof landingUpsertSchema> {
  return landingUpsertSchema.parse(data);
}

export function validateLandingUpsertMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    req.body = validateLandingUpsert(req.body);
    next();
  } catch (error) {
    next(error);
  }
}

export const landingUpsertMultiSchema = z.object({
  sections: z.array(z.object({
    page_key: z.enum(['home', 'about']),
    items: z.array(landingItemInputSchema).min(1),
  })).min(1),
});

export function validateLandingUpsertAnyMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.body && typeof req.body === 'object') {
      const body = req.body as LandingFormDataBody;
      if (typeof body.sections === 'string') {
        try {
          body.sections = JSON.parse(body.sections);
        } catch {}
      }
      if (typeof body.items === 'string') {
        try {
          body.items = JSON.parse(body.items);
        } catch {}
      }
      if (Array.isArray(body.sections)) {
        req.body = landingUpsertMultiSchema.parse({ sections: body.sections as LandingUpsertGroup[] });
      } else if (body.sections && typeof body.sections === 'object' && 'sections' in body.sections) {
        const parsed = (body.sections as { sections: unknown }).sections;
        const sections = Array.isArray(parsed) ? parsed : [];
        req.body = landingUpsertMultiSchema.parse({ sections: sections as LandingUpsertGroup[] });
      } else {
        const single = landingUpsertSchema.parse({
          page_key: body.page_key,
          items: body.items as LandingItemInput[],
        });
        req.body = { sections: [single] };
      }
    } else {
      const single = landingUpsertSchema.parse(req.body);
      req.body = { sections: [single] };
    }
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map(issue => issue.message);
      return res.status(400).json({ errors: messages });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
}

export function validateLandingGetSectionMiddleware(req: Request, res: Response, next: NextFunction) {
  const key = String(req.params.page_key || '').toLowerCase();
  if (!['home', 'about'].includes(key)) {
    return res.status(400).json({ errors: ['Invalid page_key. Allowed: home, about'] });
  }
  next();
}

// Multer error handling middleware (landing)
export const handleLandingMulterError: ErrorRequestHandler = (err, req, res, next) => {
  if (err) {
    if (err instanceof ResponseError) {
      return next(err);
    }
    
    // Multer sets 'code' for known errors like size limits
    const code = (err as { code?: string }).code;
    const message = (err as { message?: string }).message || 'Upload error';
    
    if (err instanceof MulterError) {
      if (code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ errors: ['File too large!'] });
      }
      return res.status(400).json({ errors: [message] });
    }

    if (message === 'Only image files are allowed!') {
      return res.status(400).json({ errors: ['Only image files are allowed!'] });
    }
    
    // For other errors, pass to global error handler
    return next(err);
  }
  next();
};
