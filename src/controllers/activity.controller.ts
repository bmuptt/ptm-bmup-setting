import { Request, Response, NextFunction } from 'express';
import activityService from '../services/activity.service';
import { serializeData } from '../helper/serialization.helper';
import { ActivityCreatePayload, ActivityUpdatePayload } from '../model';

export default class ActivityController {
  async createActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body as unknown as ActivityCreatePayload;
      const result = await activityService.createActivity(payload);
      res.status(201).json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async listActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await activityService.listActivities();
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async detailActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.activityId as bigint;
      const result = await activityService.detailActivity(id);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async sortActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = res.locals.activitySortIds as bigint[];
      const result = await activityService.sortActivities(ids);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async updateActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.activityId as bigint;
      const payload = req.body as unknown as ActivityUpdatePayload;
      const result = await activityService.updateActivity(id, payload);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async deleteActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.activityId as bigint;
      const result = await activityService.deleteActivity(id);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }
}
