import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { GalleryItemCreateData, GalleryItemUpdateData } from '../model';
import { GalleryItemRepositoryInterface } from './contracts/gallery-item.repository.interface';

export class GalleryItemRepository implements GalleryItemRepositoryInterface {
  async create(data: GalleryItemCreateData) {
    return prisma.galleryItem.create({ data });
  }

  async findById(id: bigint) {
    return prisma.galleryItem.findUnique({ where: { id } });
  }

  async updateById(id: bigint, data: GalleryItemUpdateData) {
    return prisma.galleryItem.update({ where: { id }, data });
  }

  async deleteById(id: bigint) {
    return prisma.galleryItem.delete({ where: { id } });
  }

  async findManyOrdered(where?: Prisma.GalleryItemWhereInput) {
    const args: Prisma.GalleryItemFindManyArgs = {
      orderBy: [{ display_order: 'asc' }, { id: 'desc' }],
    };
    if (where !== undefined) {
      args.where = where;
    }
    return prisma.galleryItem.findMany(args);
  }

  async findManyPublishedOrdered() {
    return this.findManyOrdered({ is_published: true });
  }

  async getMaxDisplayOrder() {
    const agg = await prisma.galleryItem.aggregate({
      _max: { display_order: true },
    });
    return agg._max.display_order ?? null;
  }

  async countByIds(ids: bigint[]) {
    return prisma.galleryItem.count({
      where: { id: { in: ids } },
    });
  }

  async updateDisplayOrders(ids: bigint[]) {
    return prisma.$transaction(
      ids.map((id, index) =>
        prisma.galleryItem.update({
          where: { id },
          data: { display_order: index + 1 },
        })
      )
    );
  }
}

export default new GalleryItemRepository();

