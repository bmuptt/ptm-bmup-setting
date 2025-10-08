import { Request, Response } from 'express';
import coreService from '../services/core.service';
import { uploadSingle } from '../config/multer';

export default class CoreController {
  /**
   * Get core configuration data
   */
  async getCoreData(req: Request, res: Response): Promise<void> {
    try {
      const result = await coreService.getCoreData();
      
      res.json(result);
    } catch (error) {
      console.error('[Core Controller] Get core data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve core configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update core configuration data
   */
  async updateCoreData(req: Request, res: Response): Promise<void> {
    try {
      const result = await coreService.updateCoreData(req.body, req.file, req.user?.id);
      
      res.json(result);
    } catch (error) {
      console.error('[Core Controller] Update core data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update core configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}