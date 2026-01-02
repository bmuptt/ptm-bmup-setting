import { NextFunction, Request, Response } from 'express';
import { serializeData } from '../helper/serialization.helper';
import {
  TrainingScheduleCreatePayload,
  TrainingScheduleListQuery,
  TrainingScheduleUpdatePayload,
} from '../model';
import trainingScheduleService from '../services/training-schedule.service';
import { Prisma } from '@prisma/client';

export default class TrainingScheduleController {
  async createTrainingSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body as unknown as TrainingScheduleCreatePayload;
      const userId = req.user?.id;
      const result = await trainingScheduleService.createTrainingSchedule(payload, userId);
      res.status(201).json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async listTrainingSchedulesCms(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (res.locals.trainingScheduleListQuery ?? req.query) as unknown as TrainingScheduleListQuery;
      const result = await trainingScheduleService.listTrainingSchedulesCms(query);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async listTrainingSchedulesLanding(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await trainingScheduleService.listTrainingSchedulesLanding();
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async detailTrainingSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.trainingScheduleId as bigint;
      const result = await trainingScheduleService.detailTrainingSchedule(id);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async sortTrainingSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = res.locals.trainingScheduleSortIds as bigint[];
      const result = await trainingScheduleService.sortTrainingSchedules(ids);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async updateTrainingSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.trainingScheduleId as bigint;
      const existing = res.locals.trainingScheduleExisting as Prisma.TrainingScheduleGetPayload<{}>;
      const payload = req.body as unknown as TrainingScheduleUpdatePayload;
      const userId = req.user?.id;
      const result = await trainingScheduleService.updateTrainingSchedule(id, payload, userId, existing);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async deleteTrainingSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.trainingScheduleId as bigint;
      const result = await trainingScheduleService.deleteTrainingSchedule(id);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }
}

