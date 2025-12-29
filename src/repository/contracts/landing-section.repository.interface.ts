import { Prisma } from '@prisma/client';

export interface LandingSectionRepositoryInterface {
  findByPageKey(page_key: string): Promise<Prisma.LandingSectionGetPayload<{}> | null>;
  findAll(): Promise<Prisma.LandingSectionGetPayload<{}>[]>;
  create(data: { page_key: string; created_by: bigint; updated_by: bigint }): Promise<Prisma.LandingSectionGetPayload<{}>>;
  ensure(page_key: string, userId: number | undefined): Promise<Prisma.LandingSectionGetPayload<{}>>;
}

