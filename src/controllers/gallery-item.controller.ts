import { NextFunction, Request, Response } from 'express';
import { serializeData } from '../helper/serialization.helper';
import { GalleryItemCreatePayload, GalleryItemListQuery, GalleryItemUpdatePayload } from '../model';
import galleryItemService from '../services/gallery-item.service';
import { Prisma } from '@prisma/client';

export default class GalleryItemController {
  async createGalleryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body as unknown as GalleryItemCreatePayload;
      const userId = req.user?.id;
      const result = await galleryItemService.createGalleryItem(payload, req.file, userId);
      res.status(201).json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async listGalleryItemsCms(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (res.locals.galleryItemListQuery ?? req.query) as unknown as GalleryItemListQuery;
      const result = await galleryItemService.listGalleryItemsCms(query);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async listGalleryItemsLanding(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await galleryItemService.listGalleryItemsLanding();
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async detailGalleryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.galleryItemId as bigint;
      const result = await galleryItemService.detailGalleryItem(id);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async sortGalleryItems(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = res.locals.galleryItemSortIds as bigint[];
      const result = await galleryItemService.sortGalleryItems(ids);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async updateGalleryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.galleryItemId as bigint;
      const existing = res.locals.galleryItemExisting as Prisma.GalleryItemGetPayload<{}>;
      const payload = req.body as unknown as GalleryItemUpdatePayload;
      const userId = req.user?.id;
      const result = await galleryItemService.updateGalleryItem(id, payload, req.file, userId, existing);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }

  async deleteGalleryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.galleryItemId as bigint;
      const existing = res.locals.galleryItemExisting as Prisma.GalleryItemGetPayload<{}>;
      const result = await galleryItemService.deleteGalleryItem(id, existing);
      res.json(serializeData(result));
    } catch (error) {
      next(error);
    }
  }
}
