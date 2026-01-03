import { ResponseError } from '../config/response-error';
import { GalleryItemCreatePayload, GalleryItemListQuery, GalleryItemUpdatePayload, GalleryItemCreateData } from '../model';
import galleryItemRepository from '../repository/gallery-item.repository';
import { Prisma } from '@prisma/client';
import { config } from '../config/environment';
import fs from 'fs';
import path from 'path';

export class GalleryItemService {
  private getStorageFilePathFromUrl(url: string) {
    const marker = '/storage/';
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    const rel = url.substring(idx + marker.length).split('?')[0]?.split('#')[0]?.trim();
    if (!rel) return null;
    const parts = rel.split('/').filter(Boolean);
    if (parts.length === 0) return null;
    if (parts.some((p) => p === '.' || p === '..')) return null;
    const filePath = path.join(process.cwd(), 'storage', ...parts);
    const storageRoot = path.join(process.cwd(), 'storage');
    if (!filePath.startsWith(storageRoot)) return null;
    return filePath;
  }

  private tryDeleteExistingImage(imageUrl: string | null | undefined) {
    if (!imageUrl) return;
    const filePath = this.getStorageFilePathFromUrl(imageUrl);
    if (!filePath) return;
    if (!fs.existsSync(filePath)) return;
    try {
      fs.unlinkSync(filePath);
    } catch {}
  }

  async createGalleryItem(payload: GalleryItemCreatePayload, file: Express.Multer.File | undefined, userId: number | undefined) {
    const maxOrder = await galleryItemRepository.getMaxDisplayOrder();
    const displayOrder = (maxOrder ?? 0) + 1;

    const actor = BigInt(userId ?? 0);
    const finalImageUrl = `${config.APP_URL}/storage/images/gallery/${file!.filename}`;
    const data: GalleryItemCreateData = {
      image_url: finalImageUrl,
      title: payload.title,
      display_order: displayOrder,
      is_published: payload.is_published ?? false,
      created_by: actor,
      updated_by: actor,
    };

    const created = await galleryItemRepository.create(data);
    return {
      success: true,
      data: created,
      message: 'Gallery item created successfully',
    };
  }

  async listGalleryItemsCms(query: GalleryItemListQuery) {
    const where = query.is_published === undefined ? undefined : { is_published: query.is_published };
    const items = await galleryItemRepository.findManyOrdered(where);
    return {
      success: true,
      data: items,
      message: 'Gallery items retrieved successfully',
      count: items.length,
    };
  }

  async listGalleryItemsLanding() {
    const items = await galleryItemRepository.findManyPublishedOrdered();
    return {
      success: true,
      data: items,
      message: 'Gallery items retrieved successfully',
      count: items.length,
    };
  }

  async detailGalleryItem(id: bigint) {
    const item = await galleryItemRepository.findById(id);
    if (!item) {
      throw new ResponseError(404, 'Gallery item not found');
    }
    return {
      success: true,
      data: item,
      message: 'Gallery item retrieved successfully',
    };
  }

  async sortGalleryItems(ids: bigint[]) {
    await galleryItemRepository.updateDisplayOrders(ids);
    return {
      success: true,
      message: 'Gallery items sorted successfully',
    };
  }

  async updateGalleryItem(
    id: bigint,
    payload: GalleryItemUpdatePayload,
    file: Express.Multer.File | undefined,
    userId: number | undefined,
    existing: Prisma.GalleryItemGetPayload<{}>
  ) {
    const actor = BigInt(userId ?? 0);
    const statusFile = parseInt(payload.status_file ?? '0');
    let finalImageUrl = existing.image_url;

    if (statusFile === 1) {
      if (file) {
        this.tryDeleteExistingImage(existing.image_url);
        finalImageUrl = `${config.APP_URL}/storage/images/gallery/${file.filename}`;
      }
    } else if (file) {
      const uploadedPath = path.join(process.cwd(), 'storage', 'images', 'gallery', file.filename);
      if (fs.existsSync(uploadedPath)) {
        try {
          fs.unlinkSync(uploadedPath);
        } catch {}
      }
    }

    const updated = await galleryItemRepository.updateById(id, {
      image_url: finalImageUrl,
      title: payload.title,
      is_published: payload.is_published ?? existing.is_published,
      updated_by: actor,
    });

    return {
      success: true,
      data: updated,
      message: 'Gallery item updated successfully',
    };
  }

  async deleteGalleryItem(id: bigint, existing: Prisma.GalleryItemGetPayload<{}>) {
    this.tryDeleteExistingImage(existing.image_url);
    await galleryItemRepository.deleteById(id);
    return {
      success: true,
      message: 'Gallery item deleted successfully',
    };
  }
}

export default new GalleryItemService();
