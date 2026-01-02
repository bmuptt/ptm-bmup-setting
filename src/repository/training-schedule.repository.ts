import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { TrainingScheduleCreateData, TrainingScheduleUpdateData } from '../model';
import { TrainingScheduleRepositoryInterface } from './contracts/training-schedule.repository.interface';

export class TrainingScheduleRepository implements TrainingScheduleRepositoryInterface {
  async create(data: TrainingScheduleCreateData) {
    return prisma.trainingSchedule.create({ data });
  }

  async findById(id: bigint) {
    return prisma.trainingSchedule.findUnique({
      where: { id },
    });
  }

  async updateById(id: bigint, data: TrainingScheduleUpdateData) {
    return prisma.trainingSchedule.update({
      where: { id },
      data,
    });
  }

  async deleteById(id: bigint) {
    return prisma.trainingSchedule.delete({
      where: { id },
    });
  }

  async findManyOrdered(where?: Prisma.TrainingScheduleWhereInput) {
    const args: Prisma.TrainingScheduleFindManyArgs = {
      orderBy: [{ display_order: 'asc' }, { id: 'desc' }],
    };
    if (where !== undefined) {
      args.where = where;
    }
    return prisma.trainingSchedule.findMany(args);
  }

  async findManyPublishedOrdered() {
    return this.findManyOrdered({ is_published: true });
  }

  async getMaxDisplayOrder() {
    const agg = await prisma.trainingSchedule.aggregate({
      _max: { display_order: true },
    });
    return agg._max.display_order ?? null;
  }

  async countByIds(ids: bigint[]) {
    return prisma.trainingSchedule.count({
      where: { id: { in: ids } },
    });
  }

  async updateDisplayOrders(ids: bigint[]) {
    return prisma.$transaction(
      ids.map((id, index) =>
        prisma.trainingSchedule.update({
          where: { id },
          data: { display_order: index + 1 },
        })
      )
    );
  }
}

export default new TrainingScheduleRepository();

