import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import iconRepository from '../repository/icon.repository';
import activityRepository from '../repository/activity.repository';
import { ActivityCreatePayload, ActivityUpdatePayload } from '../model';
import { ResponseError } from '../config/response-error';

const bigIntIdSchema = z.union([
  z.bigint().refine((v) => v >= BigInt(0), { message: 'Invalid id' }),
  z.number().int().nonnegative().transform((v) => BigInt(v)),
  z.string().trim().regex(/^\d+$/, 'Invalid id').transform((v) => BigInt(v)),
]);

export const activityCreateSchema = z.object({
  icon_id: bigIntIdSchema,
  title: z.string().min(1, 'The title is required!').max(255),
  subtitle: z.string().min(1, 'The subtitle is required!').max(500),
  is_published: z
    .union([z.boolean(), z.string().transform((val) => val === 'true')])
    .optional(),
});

export const activitySortSchema = z.object({
  ids: z.array(bigIntIdSchema).min(1, 'The ids is required!'),
});

export const activityIdParamSchema = z.object({
  id: bigIntIdSchema,
});

export const validateActivityCreateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = activityCreateSchema.parse(req.body) as ActivityCreatePayload;

    const icon = await iconRepository.findActiveById(payload.icon_id);
    if (!icon) {
      return res.status(400).json({ errors: ['The icon_id is invalid!'] });
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

export const validateActivityUpdateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = activityIdParamSchema.parse({ id: req.params.id }).id;
    const payload = activityCreateSchema.parse(req.body) as ActivityUpdatePayload;

    const existing = await activityRepository.findById(idParsed);
    if (!existing) {
      return next(new ResponseError(404, 'Activity not found'));
    }

    const icon = await iconRepository.findActiveById(payload.icon_id);
    if (!icon) {
      return res.status(400).json({ errors: ['The icon_id is invalid!'] });
    }

    res.locals.activityId = idParsed;
    req.body = payload;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateActivityDeleteMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = activityIdParamSchema.parse({ id: req.params.id }).id;
    const existing = await activityRepository.findById(idParsed);
    if (!existing) {
      return next(new ResponseError(404, 'Activity not found'));
    }
    res.locals.activityId = idParsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateActivityDetailMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = activityIdParamSchema.parse({ id: req.params.id }).id;
    res.locals.activityId = idParsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateActivitySortMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = activitySortSchema.parse(req.body);
    const ids = parsed.ids;

    const unique = new Set(ids.map((id) => id.toString()));
    if (unique.size !== ids.length) {
      return res.status(400).json({ errors: ['The ids must be unique!'] });
    }

    const foundCount = await activityRepository.countByIds(ids);
    if (foundCount !== ids.length) {
      return res.status(400).json({ errors: ['Some activities were not found!'] });
    }

    res.locals.activitySortIds = ids;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};
