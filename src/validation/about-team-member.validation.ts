import { z } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { ResponseError } from '../config/response-error';
import aboutTeamMemberRepository from '../repository/about-team-member.repository';
import { AboutTeamMemberCreatePayload, AboutTeamMemberUpdatePayload } from '../model';

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

export const aboutTeamMemberListQuerySchema = z.object({
  is_published: isPublishedQuerySchema.optional(),
});

export const aboutTeamMemberCreateSchema = z.object({
  member_id: bigIntIdSchema,
  role: z.string().min(1, 'The role is required!').max(120),
  is_published: z.union([z.boolean(), z.string().transform((val) => val === 'true')]).optional(),
});

export const aboutTeamMemberIdParamSchema = z.object({
  id: bigIntIdSchema,
});

export const aboutTeamMemberSortSchema = z.object({
  ids: z.array(bigIntIdSchema).min(1, 'The ids is required!'),
});

export const validateAboutTeamMemberListQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedQuery = aboutTeamMemberListQuerySchema.parse(req.query);
    res.locals.aboutTeamMemberListQuery = validatedQuery;
    Object.assign(req.query, validatedQuery);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid query parameters'] });
  }
};

export const validateAboutTeamMemberCreateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = aboutTeamMemberCreateSchema.parse(req.body) as AboutTeamMemberCreatePayload;
    const existing = await aboutTeamMemberRepository.findByMemberIdRole(payload.member_id, payload.role);
    if (existing) {
      return res.status(400).json({ errors: ['The member_id and role is already exists!'] });
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

export const validateAboutTeamMemberUpdateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = aboutTeamMemberIdParamSchema.parse({ id: req.params.id }).id;
    const payload = aboutTeamMemberCreateSchema.parse(req.body) as AboutTeamMemberUpdatePayload;

    const existing = await aboutTeamMemberRepository.findById(idParsed);
    if (!existing) {
      return next(new ResponseError(404, 'About team member not found'));
    }

    if (payload.member_id !== existing.member_id || payload.role !== existing.role) {
      const duplicate = await aboutTeamMemberRepository.findByMemberIdRole(payload.member_id, payload.role);
      if (duplicate && duplicate.id !== idParsed) {
        return res.status(400).json({ errors: ['The member_id and role is already exists!'] });
      }
    }

    res.locals.aboutTeamMemberId = idParsed;
    res.locals.aboutTeamMemberExisting = existing;
    req.body = payload;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateAboutTeamMemberDeleteMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = aboutTeamMemberIdParamSchema.parse({ id: req.params.id }).id;
    const existing = await aboutTeamMemberRepository.findById(idParsed);
    if (!existing) {
      return next(new ResponseError(404, 'About team member not found'));
    }
    res.locals.aboutTeamMemberId = idParsed;
    res.locals.aboutTeamMemberExisting = existing;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateAboutTeamMemberDetailMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParsed = aboutTeamMemberIdParamSchema.parse({ id: req.params.id }).id;
    res.locals.aboutTeamMemberId = idParsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};

export const validateAboutTeamMemberSortMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = aboutTeamMemberSortSchema.parse(req.body);
    const ids = parsed.ids;

    const unique = new Set(ids.map((id) => id.toString()));
    if (unique.size !== ids.length) {
      return res.status(400).json({ errors: ['The ids must be unique!'] });
    }

    const foundCount = await aboutTeamMemberRepository.countByIds(ids);
    if (foundCount !== ids.length) {
      return res.status(400).json({ errors: ['Some about team members were not found!'] });
    }

    res.locals.aboutTeamMemberSortIds = ids;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues.map((issue) => issue.message) });
    }
    return res.status(400).json({ errors: ['Invalid request payload'] });
  }
};
