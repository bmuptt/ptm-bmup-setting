import { NextFunction, Request, Response } from 'express';
import { serializeData } from '../helper/serialization.helper';
import {
  AboutTeamMemberCreatePayload,
  AboutTeamMemberListQuery,
  AboutTeamMemberUpdatePayload,
} from '../model';
import aboutTeamMemberService from '../services/about-team-member.service';
import { Prisma } from '@prisma/client';

export default class AboutTeamMemberController {
  async createAboutTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body as unknown as AboutTeamMemberCreatePayload;
      const userId = req.user?.id;
      const result = await aboutTeamMemberService.createAboutTeamMember(payload, userId);
      res.status(201).json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async listAboutTeamMembersCms(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (res.locals.aboutTeamMemberListQuery ?? req.query) as unknown as AboutTeamMemberListQuery;
      const result = await aboutTeamMemberService.listAboutTeamMembersCms(query);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async listAboutTeamMembersLanding(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await aboutTeamMemberService.listAboutTeamMembersLanding();
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async detailAboutTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.aboutTeamMemberId as bigint;
      const result = await aboutTeamMemberService.detailAboutTeamMember(id);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async sortAboutTeamMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = res.locals.aboutTeamMemberSortIds as bigint[];
      const result = await aboutTeamMemberService.sortAboutTeamMembers(ids);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async updateAboutTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.aboutTeamMemberId as bigint;
      const payload = req.body as unknown as AboutTeamMemberUpdatePayload;
      const userId = req.user?.id;
      const existing = res.locals.aboutTeamMemberExisting as Prisma.AboutTeamMemberGetPayload<{}>;
      const result = await aboutTeamMemberService.updateAboutTeamMember(id, payload, userId, existing);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async deleteAboutTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.aboutTeamMemberId as bigint;
      const result = await aboutTeamMemberService.deleteAboutTeamMember(id);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }
}
