import { Request, Response, NextFunction } from 'express';
import iconService from '../services/icon.service';
import { serializeData } from '../helper/serialization.helper';

export default class IconController {
  async getActiveIcons(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await iconService.getActiveIcons();
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }
}

