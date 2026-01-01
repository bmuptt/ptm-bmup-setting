import { NextFunction, Request, Response } from 'express';
import { serializeData } from '../helper/serialization.helper';
import { AboutTimelineCreatePayload, AboutTimelineListQuery, AboutTimelineUpdatePayload } from '../model';
import aboutTimelineService from '../services/about-timeline.service';

export default class AboutTimelineController {
  async createAboutTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body as unknown as AboutTimelineCreatePayload;
      const userId = req.user?.id;
      const result = await aboutTimelineService.createAboutTimeline(payload, userId);
      res.status(201).json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async listAboutTimelines(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (res.locals.aboutTimelineListQuery ?? req.query) as unknown as AboutTimelineListQuery;
      const result = await aboutTimelineService.listAboutTimelinesCms(query);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async listAboutTimelinesLanding(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await aboutTimelineService.listAboutTimelinesLanding();
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async detailAboutTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.aboutTimelineId as bigint;
      const result = await aboutTimelineService.detailAboutTimeline(id);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async updateAboutTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.aboutTimelineId as bigint;
      const payload = req.body as unknown as AboutTimelineUpdatePayload;
      const userId = req.user?.id;
      const result = await aboutTimelineService.updateAboutTimeline(id, payload, userId);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async deleteAboutTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.aboutTimelineId as bigint;
      const result = await aboutTimelineService.deleteAboutTimeline(id);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }
}
