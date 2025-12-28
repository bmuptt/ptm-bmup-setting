import landingSectionRepository from '../repository/landing-section.repository';
import landingItemRepository from '../repository/landing-item.repository';
import { LandingUpsertPayload, LandingUpsertResultItem, LandingUpsertMultiPayload, LandingUpsertGroup } from '../model';
import fs from 'fs';
import path from 'path';
import { config } from '../config/environment';
import { ResponseError } from '../config/response-error';
 

export class LandingService {
  async upsertItems(payload: LandingUpsertPayload, userId?: number, files?: Express.Multer.File[]) {
    const section = await landingSectionRepository.ensure(payload.page_key, userId);
    const actor = BigInt(userId ?? 0);

    const results: LandingUpsertResultItem[] = [];
    for (const item of payload.items) {
      let finalImageUrl: string | null | undefined = item.image_url ?? undefined;
      const existing = await landingItemRepository.findBySectionAndKey(section.id, item.key);
      const statusImage = item.status_image ? parseInt(item.status_image) : 0;

      if (statusImage === 0 && finalImageUrl === undefined) {
        finalImageUrl = existing?.image_url;
      }
      
      if (statusImage === 1) {
        // Check for file in 'image' property (mapped from form-data) OR 'image_key' (legacy)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let uploadedFile = (item as unknown as Record<string, unknown>).image as Express.Multer.File | undefined;
        
        if (!uploadedFile) {
          const fieldName = `image_${item.key}`;
          uploadedFile = files?.find(f => f.fieldname === fieldName);
        }

        if (uploadedFile) {
          if (existing?.image_url) {
            const oldFilename = existing.image_url.split('/').pop();
            if (oldFilename) {
              const oldPath = path.join(process.cwd(), 'storage', 'images', oldFilename);
              if (fs.existsSync(oldPath)) {
                try { fs.unlinkSync(oldPath); } catch {}
              }
            }
          }
          finalImageUrl = `${config.APP_URL}/storage/images/${uploadedFile.filename}`;
        } else {
          // If status is 1 but no file provided, it means delete the image
          if (existing?.image_url) {
            const oldFilename = existing.image_url.split('/').pop();
            if (oldFilename) {
              const oldPath = path.join(process.cwd(), 'storage', 'images', oldFilename);
              if (fs.existsSync(oldPath)) {
                try { fs.unlinkSync(oldPath); } catch {}
              }
            }
          }
          finalImageUrl = null;
        }
      }

      const saved = await landingItemRepository.upsert(section.id, item.key, {
        type: item.type ?? null,
        title: item.title ?? null,
        content: item.content ?? null,
        image_url: finalImageUrl ?? null,
        button_label: item.button_label ?? null,
        button_url: item.button_url ?? null,
        published: item.published,
        created_by: actor,
        updated_by: actor,
      });

      results.push({
        id: saved.id,
        key: saved.key,
        type: saved.type,
        title: saved.title,
        content: saved.content,
        image_url: saved.image_url,
        button_label: saved.button_label,
        button_url: saved.button_url,
        published: saved.published,
        created_by: saved.created_by,
        updated_by: saved.updated_by,
      });
    }

    return {
      success: true,
      data: {
        section: {
          id: section.id,
          page_key: section.page_key,
        },
        items: results,
      },
      message: 'Landing items upserted successfully',
    };
  }

  async getSection(pageKey: 'home' | 'about') {
    const section = await landingSectionRepository.findByPageKey(pageKey);
    if (!section) {
      throw new ResponseError(404, 'Landing section not found');
    }
    const items = await landingItemRepository.findManyBySectionId(section.id);
    const results: {
      id: bigint;
      key: string;
      type: string | null;
      title: string | null;
      content: string | null;
      image_url: string | null;
      button_label: string | null;
      button_url: string | null;
      published: boolean;
      created_by: bigint;
      updated_by: bigint;
    }[] = items.map((saved) => ({
      id: saved.id,
      key: saved.key,
      type: saved.type,
      title: saved.title,
      content: saved.content,
      image_url: saved.image_url,
      button_label: saved.button_label,
      button_url: saved.button_url,
      published: saved.published,
      created_by: saved.created_by,
      updated_by: saved.updated_by,
    }));
    return {
      success: true,
      data: {
        section: {
          id: section.id,
          page_key: section.page_key,
        },
        items: results,
      },
      message: 'Landing section retrieved successfully',
    };
  }

  async getAllSections() {
    const sections = await landingSectionRepository.findAll();
    const out: { section: { id: bigint; page_key: string }; items: LandingUpsertResultItem[] }[] = [];
    for (const section of sections) {
      const items = await landingItemRepository.findManyBySectionId(section.id);
      const results: {
        id: bigint;
        key: string;
        type: string | null;
        title: string | null;
        content: string | null;
        image_url: string | null;
        button_label: string | null;
        button_url: string | null;
        published: boolean;
        created_by: bigint;
        updated_by: bigint;
      }[] = items.map((saved) => ({
        id: saved.id,
        key: saved.key,
        type: saved.type,
        title: saved.title,
        content: saved.content,
        image_url: saved.image_url,
        button_label: saved.button_label,
        button_url: saved.button_url,
        published: saved.published,
        created_by: saved.created_by,
        updated_by: saved.updated_by,
      }));
      out.push({
        section: { id: section.id, page_key: section.page_key },
        items: results,
      });
    }
    return {
      success: true,
      data: out,
      message: 'Landing sections retrieved successfully',
    };
  }

  async upsertItemsMulti(payload: LandingUpsertMultiPayload, userId?: number, files?: Express.Multer.File[]) {
    const actor = BigInt(userId ?? 0);
    const out: { section: { id: bigint; page_key: string }, items: LandingUpsertResultItem[] }[] = [];

    for (const group of payload.sections as LandingUpsertGroup[]) {
      const section = await landingSectionRepository.ensure(group.page_key, userId);
      const items: LandingUpsertResultItem[] = [];
      for (const item of group.items) {
        let finalImageUrl: string | null | undefined = item.image_url ?? undefined;
        const existing = await landingItemRepository.findBySectionAndKey(section.id, item.key);
        const statusImage = item.status_image ? parseInt(item.status_image) : 0;

        if (statusImage === 0 && finalImageUrl === undefined) {
          finalImageUrl = existing?.image_url;
        }
        
        if (statusImage === 1) {
           // Check for file in 'image' property (mapped from form-data) OR 'image_key' (legacy)
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           let uploadedFile = (item as unknown as Record<string, unknown>).image as Express.Multer.File | undefined;
           
           if (!uploadedFile) {
             const fieldName = `image_${item.key}`;
             uploadedFile = files?.find(f => f.fieldname === fieldName);
           }

          if (uploadedFile) {
            if (existing?.image_url) {
              const oldFilename = existing.image_url.split('/').pop();
              if (oldFilename) {
                const oldPath = path.join(process.cwd(), 'storage', 'images', oldFilename);
                if (fs.existsSync(oldPath)) {
                  try { fs.unlinkSync(oldPath); } catch {}
                }
              }
            }
            finalImageUrl = `${config.APP_URL}/storage/images/${uploadedFile.filename}`;
          } else {
             // If status is 1 but no file provided, it means delete the image
            if (existing?.image_url) {
              const oldFilename = existing.image_url.split('/').pop();
              if (oldFilename) {
                const oldPath = path.join(process.cwd(), 'storage', 'images', oldFilename);
                if (fs.existsSync(oldPath)) {
                  try { fs.unlinkSync(oldPath); } catch {}
                }
              }
            }
            finalImageUrl = null;
          }
        }

        const saved = await landingItemRepository.upsert(section.id, item.key, {
          type: item.type ?? null,
          title: item.title ?? null,
          content: item.content ?? null,
          image_url: finalImageUrl ?? null,
          button_label: item.button_label ?? null,
          button_url: item.button_url ?? null,
          published: item.published,
          created_by: actor,
          updated_by: actor,
        });
        items.push({
          id: saved.id,
          key: saved.key,
          type: saved.type,
          title: saved.title,
          content: saved.content,
          image_url: saved.image_url,
          button_label: saved.button_label,
          button_url: saved.button_url,
          published: saved.published,
          created_by: saved.created_by,
          updated_by: saved.updated_by,
        });
      }
      out.push({
        section: { id: section.id, page_key: section.page_key },
        items,
      });
    }

    return {
      success: true,
      data: out,
      message: 'Landing items upserted successfully',
    };
  }
}

export default new LandingService();
