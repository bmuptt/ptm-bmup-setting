import { Prisma } from '@prisma/client';
import { TrainingScheduleCreateData, TrainingScheduleUpdateData } from '../../model';

export interface TrainingScheduleRepositoryInterface {
  create(data: TrainingScheduleCreateData): Promise<Prisma.TrainingScheduleGetPayload<{}>>;

  findById(id: bigint): Promise<Prisma.TrainingScheduleGetPayload<{}> | null>;

  updateById(id: bigint, data: TrainingScheduleUpdateData): Promise<Prisma.TrainingScheduleGetPayload<{}>>;

  deleteById(id: bigint): Promise<Prisma.TrainingScheduleGetPayload<{}>>;

  findManyOrdered(where?: Prisma.TrainingScheduleWhereInput): Promise<Prisma.TrainingScheduleGetPayload<{}>[]>;

  findManyPublishedOrdered(): Promise<Prisma.TrainingScheduleGetPayload<{}>[]>;

  getMaxDisplayOrder(): Promise<number | null>;

  countByIds(ids: bigint[]): Promise<number>;

  updateDisplayOrders(ids: bigint[]): Promise<Prisma.TrainingScheduleGetPayload<{}>[]>;
}

