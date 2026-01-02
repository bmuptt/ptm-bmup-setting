import { z } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { ResponseError } from '../config/response-error';
import trainingScheduleRepository from '../repository/training-schedule.repository';
import memberRepository from '../repository/member.repository';
import { TrainingScheduleCreatePayload, TrainingScheduleUpdatePayload } from '../model';

const bigIntIdSchema = z.union([
  z.bigint().refine((v) => v >= BigInt(0), { message: 'Invalid id' }),
  z.number().int().nonnegative().transform((v) => BigInt(v)),
  z.string().trim().regex(/^\d+$/, 'Invalid id').transform((v) => BigInt(v)),
]);

const safeBigIntToNumber = (value: bigint): number | null => {
  if (value <= BigInt(Number.MAX_SAFE_INTEGER) && value >= BigInt(0)) {
    return Number(value);
  }
  return null;
};

const dayOfWeekSchema = z.union([
  z.number().int(),
  z.string().trim().regex(/^\d+$/, 'The day_of_week is required!').transform((v) => Number(v)),
]).refine((v) => v >= 1 && v <= 7, { message: 'The day_of_week is invalid!' });

const timeSchema = z
  .string()
  .min(1, 'The time is required!')
  .trim()
  .refine((value) => /^\d{2}:\d{2}(:\d{2})?$/.test(value), { message: 'The time is invalid!' })
  .refine((value) => {
    const normalized = value.length === 5 ? `${value}:00` : value;
    const parts = normalized.split(':');
    if (parts.length !== 3) return false;
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    const s = Number(parts[2]);
    if ([h, m, s].some((x) => Number.isNaN(x))) return false;
    return h >= 0 && h <= 23 && m >= 0 && m <= 59 && s >= 0 && s <= 59;
  }, { message: 'The time is invalid!' });

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

export const trainingScheduleListQuerySchema = z.object({
  is_published: isPublishedQuerySchema.optional(),
});

export const trainingScheduleCreateSchema = z.object({
  day_of_week: dayOfWeekSchema,
  start_time: timeSchema,
  end_time: timeSchema,
  category: z.string().min(1, 'The category is required!').max(100),
  member_id: z.union([bigIntIdSchema, z.null()]).optional(),
  is_published: z.union([z.boolean(), z.string().transform((val) => val === 'true')]).optional(),
});

export const trainingScheduleIdParamSchema = z.object({
  id: bigIntIdSchema,
});

export const trainingScheduleSortSchema = z.object({
  ids: z.array(bigIntIdSchema).min(1, 'The ids is required!'),
});

const timeToMinutes = (value: string) => {
  const normalized = value.length === 5 ? `${value}:00` : value;
  const parts = normalized.split(':');
  const h = Number(parts[0] ?? Number.NaN);
  const m = Number(parts[1] ?? Number.NaN);
  const s = Number(parts[2] ?? Number.NaN);
  return h * 60 + m + s / 60;
};

export const validateTrainingScheduleListQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedQuery = trainingScheduleListQuerySchema.parse(req.query);
    res.locals.trainingScheduleListQuery = validatedQuery;
    Object.assign(req.query, validatedQuery);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid query parameters'] });
  }
};

export const validateTrainingScheduleCreateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = trainingScheduleCreateSchema.parse(req.body) as TrainingScheduleCreatePayload;

    if (timeToMinutes(payload.end_time) <= timeToMinutes(payload.start_time)) {
      return res.status(400).json({ errors: ['The end_time must be greater than start_time!'] });
    }

    if (payload.member_id !== undefined && payload.member_id !== null) {
      const asNumber = safeBigIntToNumber(payload.member_id);
      if (!asNumber || asNumber <= 0) {
        return res.status(400).json({ errors: ['The member_id is invalid!'] });
      }
      const found = await memberRepository.findBasicById(asNumber);
      if (!found) {
        return res.status(400).json({ errors: ['The member_id was not found!'] });
      }
    }

    req.body = payload;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue) => {
        if (issue.path[0] === 'start_time') {
          return issue.message === 'The time is required!' ? 'The start_time is required!' : 'The start_time is invalid!';
        }
        if (issue.path[0] === 'end_time') {
          return issue.message === 'The time is required!' ? 'The end_time is required!' : 'The end_time is invalid!';
        }
        return issue.message;
      });
      return res.status(400).json({ errors });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateTrainingScheduleUpdateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = trainingScheduleIdParamSchema.parse({ id: req.params.id }).id;
    const payload = trainingScheduleCreateSchema.parse(req.body) as TrainingScheduleUpdatePayload;

    const existing = await trainingScheduleRepository.findById(idParsed);
    if (!existing) {
      return next(new ResponseError(404, 'Training schedule not found'));
    }

    if (timeToMinutes(payload.end_time) <= timeToMinutes(payload.start_time)) {
      return res.status(400).json({ errors: ['The end_time must be greater than start_time!'] });
    }

    if (payload.member_id !== undefined && payload.member_id !== null) {
      const asNumber = safeBigIntToNumber(payload.member_id);
      if (!asNumber || asNumber <= 0) {
        return res.status(400).json({ errors: ['The member_id is invalid!'] });
      }
      const found = await memberRepository.findBasicById(asNumber);
      if (!found) {
        return res.status(400).json({ errors: ['The member_id was not found!'] });
      }
    }

    res.locals.trainingScheduleId = idParsed;
    res.locals.trainingScheduleExisting = existing;
    req.body = payload;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue) => {
        if (issue.path[0] === 'start_time') {
          return issue.message === 'The time is required!' ? 'The start_time is required!' : 'The start_time is invalid!';
        }
        if (issue.path[0] === 'end_time') {
          return issue.message === 'The time is required!' ? 'The end_time is required!' : 'The end_time is invalid!';
        }
        return issue.message;
      });
      return res.status(400).json({ errors });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateTrainingScheduleDeleteMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = trainingScheduleIdParamSchema.parse({ id: req.params.id }).id;
    const existing = await trainingScheduleRepository.findById(idParsed);
    if (!existing) {
      return next(new ResponseError(404, 'Training schedule not found'));
    }
    res.locals.trainingScheduleId = idParsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateTrainingScheduleDetailMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = trainingScheduleIdParamSchema.parse({ id: req.params.id }).id;
    res.locals.trainingScheduleId = idParsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateTrainingScheduleSortMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = trainingScheduleSortSchema.parse(req.body);
    const ids = parsed.ids;

    const unique = new Set(ids.map((id) => id.toString()));
    if (unique.size !== ids.length) {
      return res.status(400).json({ errors: ['The ids must be unique!'] });
    }

    const foundCount = await trainingScheduleRepository.countByIds(ids);
    if (foundCount !== ids.length) {
      return res.status(400).json({ errors: ['Some training schedules were not found!'] });
    }

    res.locals.trainingScheduleSortIds = ids;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};
