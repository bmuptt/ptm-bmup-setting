import prisma from '../config/database';
import { LandingItemRepositoryInterface } from './contracts/landing-item.repository.interface';

export class LandingItemRepository implements LandingItemRepositoryInterface {
  async findBySectionAndKey(section_id: bigint, key: string) {
    return prisma.landingItem.findFirst({
      where: { section_id, key },
    });
  }
  async findManyBySectionId(section_id: bigint) {
    return prisma.landingItem.findMany({
      where: { section_id },
      orderBy: { id: 'desc' },
    });
  }
  async upsert(section_id: bigint, key: string, data: {
    type?: string | null;
    title?: string | null;
    content?: string | null;
    image_url?: string | null;
    button_label?: string | null;
    button_url?: string | null;
    published: boolean;
    created_by: bigint;
    updated_by: bigint;
  }) {
    return prisma.landingItem.upsert({
      where: {
        section_id_key: { section_id, key },
      },
      create: {
        section_id,
        key,
        type: data.type ?? null,
        title: data.title ?? null,
        content: data.content ?? null,
        image_url: data.image_url ?? null,
        button_label: data.button_label ?? null,
        button_url: data.button_url ?? null,
        published: data.published,
        created_by: data.created_by,
        updated_by: data.updated_by,
      },
      update: {
        type: data.type ?? null,
        title: data.title ?? null,
        content: data.content ?? null,
        image_url: data.image_url ?? null,
        button_label: data.button_label ?? null,
        button_url: data.button_url ?? null,
        published: data.published,
        updated_by: data.updated_by,
      },
    });
  }
}

export default new LandingItemRepository();
