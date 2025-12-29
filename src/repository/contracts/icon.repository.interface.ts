import { Prisma } from '@prisma/client';

export interface IconRepositoryInterface {
  findManyActive(): Promise<Prisma.IconGetPayload<{}>[]>;
  findActiveById(id: bigint): Promise<Prisma.IconGetPayload<{}> | null>;
}

