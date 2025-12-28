import { Request, Response, NextFunction } from 'express';
import landingService from '../services/landing.service';
import { serializeData } from '../helper/serialization.helper';

export default class LandingController {
  async upsertItems(req: Request, res: Response, next: NextFunction) {
    try {
      const hasSections = req.body && typeof req.body === 'object' && 'sections' in req.body;
      const files = (req.files as Express.Multer.File[]) || [];
      const result = hasSections
        ? await landingService.upsertItemsMulti(req.body, req.user?.id, files)
        : await landingService.upsertItems(req.body, req.user?.id, files);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async getSection(req: Request, res: Response, next: NextFunction) {
    try {
      const pageKey = String(req.params.page_key) as 'home' | 'about';
      const result = await landingService.getSection(pageKey);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async getAllSections(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await landingService.getAllSections();
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }
}
