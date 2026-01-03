import { Prisma } from '@prisma/client';
import { GalleryItemCreateData, GalleryItemUpdateData } from '../../model';

export interface GalleryItemRepositoryInterface {
  create(data: GalleryItemCreateData): Promise<Prisma.GalleryItemGetPayload<{}>>;

  findById(id: bigint): Promise<Prisma.GalleryItemGetPayload<{}> | null>;

  updateById(id: bigint, data: GalleryItemUpdateData): Promise<Prisma.GalleryItemGetPayload<{}>>;

  deleteById(id: bigint): Promise<Prisma.GalleryItemGetPayload<{}>>;

  findManyOrdered(where?: Prisma.GalleryItemWhereInput): Promise<Prisma.GalleryItemGetPayload<{}>[]>;

  findManyPublishedOrdered(): Promise<Prisma.GalleryItemGetPayload<{}>[]>;

  getMaxDisplayOrder(): Promise<number | null>;

  countByIds(ids: bigint[]): Promise<number>;

  updateDisplayOrders(ids: bigint[]): Promise<Prisma.GalleryItemGetPayload<{}>[]>;
}

