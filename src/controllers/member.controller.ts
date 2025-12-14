import { Request, Response, NextFunction } from 'express';
import memberService from '../services/member.service';
import { uploadSingle } from '../config/multer';
import { MemberExternalData } from '../model';
import { Prisma } from '@prisma/client';

export default class MemberController {
  /**
   * Get member by ID
   */
  async getMemberById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await memberService.getMemberById(parseInt(id || '0'));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all members with pagination, search, filtering, and custom ordering
   */
  async getAllMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      // Support both snake_case (order_field, order_dir) and camelCase (orderField, orderDir)
      const orderField = (req.query.order_field || req.query.orderField) as string;
      const orderDir = (req.query.order_dir || req.query.orderDir) as string;
      const active = req.query.active as string;
      // Get token from cookie to forward to external service for email lookup
      const token = req.cookies?.token;

      const result = await memberService.getAllMembers(page, perPage, search, orderField, orderDir, active, token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Load more members with cursor-based pagination
   */
  async loadMoreMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;
      const search = req.query.search as string;

      const result = await memberService.loadMoreMembers(
        limit,
        cursor,
        search
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new member
   */
  async createMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await memberService.createMember(req.body, req.file, req.user?.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update member
   */
  async updateMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await memberService.updateMember(parseInt(id || '0'), req.body, req.file, req.user?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete member
   */
  async deleteMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await memberService.deleteMember(parseInt(id || '0'));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create external user for member
   */
  async createMemberUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const member = res.locals.memberForExternal as MemberExternalData;
      // Get token from cookie (httpOnly and secure cookies are accessible server-side)
      // cookie-parser automatically parses cookies from Cookie header
      const token = req.cookies?.token;
      
      const result = await memberService.createMemberUser(
        member,
        {
          email: req.body.email,
          role_id: req.body.role_id,
        },
        token // Forward token to service for external API calls
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Import members from Excel
   */
  async importMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const membersToCreate = res.locals.membersToCreate as Prisma.MemberCreateManyInput[];
      const result = await memberService.importMembersFromRows(membersToCreate);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMembersByIds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = res.locals.byIds as {
        ids: number[];
        orderField?: string;
        orderDir?: 'asc' | 'desc';
      };
      const token = req.cookies?.token;
      const result = await memberService.getMembersByIds(params.ids, params.orderField, params.orderDir, token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
