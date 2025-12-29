import prisma from '../config/database';
import { ActivityRepositoryInterface } from './contracts/activity.repository.interface';

export class ActivityRepository implements ActivityRepositoryInterface {
  async create(data: {
    icon_id: bigint;
    title: string;
    subtitle: string;
    is_published: boolean;
    sort_order: number | null;
  }) {
    return prisma.activity.create({ data });
  }

  async findById(id: bigint) {
    return prisma.activity.findUnique({
      where: { id },
    });
  }

  async findByIdWithIcon(id: bigint) {
    return prisma.activity.findUnique({
      where: { id },
      include: {
        icon: {
          select: {
            id: true,
            name: true,
            label: true,
            is_active: true,
          },
        },
      },
    });
  }

  async updateById(
    id: bigint,
    data: Partial<{
      icon_id: bigint;
      title: string;
      subtitle: string;
      is_published: boolean;
      sort_order: number | null;
    }>
  ) {
    return prisma.activity.update({
      where: { id },
      data,
    });
  }

  async deleteById(id: bigint) {
    return prisma.activity.delete({
      where: { id },
    });
  }

  async findManyWithIconOrdered() {
    return prisma.activity.findMany({
      include: {
        icon: {
          select: {
            id: true,
            name: true,
            label: true,
            is_active: true,
          },
        },
      },
      orderBy: [
        { sort_order: { sort: 'asc', nulls: 'last' } },
        { id: 'desc' },
      ],
    });
  }

  async getMaxSortOrder() {
    const agg = await prisma.activity.aggregate({
      _max: { sort_order: true },
    });
    return agg._max.sort_order ?? null;
  }

  async countByIds(ids: bigint[]) {
    return prisma.activity.count({
      where: { id: { in: ids } },
    });
  }

  async updateSortOrders(ids: bigint[]) {
    return prisma.$transaction(
      ids.map((id, index) =>
        prisma.activity.update({
          where: { id },
          data: { sort_order: index + 1 },
        })
      )
    );
  }
}

export default new ActivityRepository();
