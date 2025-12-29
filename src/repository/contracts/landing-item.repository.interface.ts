import { Prisma } from '@prisma/client';

export interface LandingItemRepositoryInterface {
  findBySectionAndKey(section_id: bigint, key: string): Promise<Prisma.LandingItemGetPayload<{}> | null>;
  findManyBySectionId(section_id: bigint): Promise<Prisma.LandingItemGetPayload<{}>[]>;
  upsert(
    section_id: bigint,
    key: string,
    data: {
      type?: string | null;
      title?: string | null;
      content?: string | null;
      image_url?: string | null;
      button_label?: string | null;
      button_url?: string | null;
      published: boolean;
      created_by: bigint;
      updated_by: bigint;
    }
  ): Promise<Prisma.LandingItemGetPayload<{}>>;
}

