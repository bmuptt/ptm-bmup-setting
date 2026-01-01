import { z } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { ResponseError } from '../config/response-error';
import aboutTimelineRepository from '../repository/about-timeline.repository';
import { AboutTimelineCreatePayload, AboutTimelineUpdatePayload } from '../model';

const bigIntIdSchema = z.union([
  z.bigint().refine((v) => v >= BigInt(0), { message: 'Invalid id' }),
  z.number().int().nonnegative().transform((v) => BigInt(v)),
  z.string().trim().regex(/^\d+$/, 'Invalid id').transform((v) => BigInt(v)),
]);

const yearSchema = z.union([
  z.number().int().nonnegative(),
  z.string().trim().regex(/^\d+$/, 'The year is required!').transform((v) => Number(v)),
]).refine((v) => v <= 32767, { message: 'The year is invalid!' });

export const aboutTimelineCreateSchema = z.object({
  year: yearSchema,
  title: z.string().min(1, 'The title is required!').max(150),
  description: z.string().min(1, 'The description is required!'),
  is_published: z.union([z.boolean(), z.string().transform((val) => val === 'true')]).optional(),
});

export const aboutTimelineIdParamSchema = z.object({
  id: bigIntIdSchema,
});

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

export const aboutTimelineListQuerySchema = z.object({
  is_published: isPublishedQuerySchema.optional(),
});

export const validateAboutTimelineListQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedQuery = aboutTimelineListQuerySchema.parse(req.query);
    res.locals.aboutTimelineListQuery = validatedQuery;
    Object.assign(req.query, validatedQuery);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid query parameters'] });
  }
};

export const validateAboutTimelineCreateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = aboutTimelineCreateSchema.parse(req.body) as AboutTimelineCreatePayload;
    const existingYear = await aboutTimelineRepository.findByYear(payload.year);
    if (existingYear) {
      return res.status(400).json({ errors: ['The year is already exists!'] });
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

export const validateAboutTimelineUpdateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = aboutTimelineIdParamSchema.parse({ id: req.params.id }).id;
    const payload = aboutTimelineCreateSchema.parse(req.body) as AboutTimelineUpdatePayload;

    const existing = await aboutTimelineRepository.findById(idParsed);
    if (!existing) {
      return next(new ResponseError(404, 'About timeline not found'));
    }

    if (payload.year !== existing.year) {
      const existingYear = await aboutTimelineRepository.findByYear(payload.year);
      if (existingYear) {
        return res.status(400).json({ errors: ['The year is already exists!'] });
      }
    }

    res.locals.aboutTimelineId = idParsed;
    req.body = payload;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateAboutTimelineDeleteMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = aboutTimelineIdParamSchema.parse({ id: req.params.id }).id;
    const existing = await aboutTimelineRepository.findById(idParsed);
    if (!existing) {
      return next(new ResponseError(404, 'About timeline not found'));
    }
    res.locals.aboutTimelineId = idParsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateAboutTimelineDetailMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = aboutTimelineIdParamSchema.parse({ id: req.params.id }).id;
    res.locals.aboutTimelineId = idParsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};
