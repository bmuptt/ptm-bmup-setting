import { Request, Response, NextFunction } from 'express';
import coreService from '../services/core.service';
import { uploadSingle } from '../config/multer';

export default class CoreController {
  /**
   * Get core configuration data
   */
  async getCoreData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await coreService.getCoreData();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update core configuration data
   */
  async updateCoreData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await coreService.updateCoreData(req.body, req.file, req.user?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}