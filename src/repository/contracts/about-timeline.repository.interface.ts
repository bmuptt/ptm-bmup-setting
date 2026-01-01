import { Prisma } from '@prisma/client';
import { AboutTimelineCreateData, AboutTimelineUpdateData } from '../../model';

export interface AboutTimelineRepositoryInterface {
  create(data: AboutTimelineCreateData): Promise<Prisma.AboutTimelineGetPayload<{}>>;

  findById(id: bigint): Promise<Prisma.AboutTimelineGetPayload<{}> | null>;

  findByYear(year: number): Promise<Prisma.AboutTimelineGetPayload<{}> | null>;

  updateById(
    id: bigint,
    data: AboutTimelineUpdateData
  ): Promise<Prisma.AboutTimelineGetPayload<{}>>;

  deleteById(id: bigint): Promise<Prisma.AboutTimelineGetPayload<{}>>;

  findManyOrdered(where?: Prisma.AboutTimelineWhereInput): Promise<Prisma.AboutTimelineGetPayload<{}>[]>;

  findManyPublishedOrdered(): Promise<Prisma.AboutTimelineGetPayload<{}>[]>;
}
