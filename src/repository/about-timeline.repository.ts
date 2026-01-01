import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { AboutTimelineCreateData, AboutTimelineUpdateData } from '../model';
import { AboutTimelineRepositoryInterface } from './contracts/about-timeline.repository.interface';

export class AboutTimelineRepository implements AboutTimelineRepositoryInterface {
  async create(data: AboutTimelineCreateData) {
    return prisma.aboutTimeline.create({ data });
  }

  async findById(id: bigint) {
    return prisma.aboutTimeline.findUnique({
      where: { id },
    });
  }

  async findByYear(year: number) {
    return prisma.aboutTimeline.findUnique({
      where: { year },
    });
  }

  async updateById(
    id: bigint,
    data: AboutTimelineUpdateData
  ) {
    return prisma.aboutTimeline.update({
      where: { id },
      data,
    });
  }

  async deleteById(id: bigint) {
    return prisma.aboutTimeline.delete({
      where: { id },
    });
  }

  async findManyOrdered(where?: Prisma.AboutTimelineWhereInput) {
    const args: Prisma.AboutTimelineFindManyArgs = {
      orderBy: [{ year: 'asc' }, { id: 'desc' }],
    };
    if (where !== undefined) {
      args.where = where;
    }
    return prisma.aboutTimeline.findMany(args);
  }

  async findManyPublishedOrdered() {
    return this.findManyOrdered({ is_published: true });
  }
}

export default new AboutTimelineRepository();
