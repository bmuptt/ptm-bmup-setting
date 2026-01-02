import { Prisma } from '@prisma/client';
import { AboutTeamMemberCreateData, AboutTeamMemberUpdateData } from '../../model';

export interface AboutTeamMemberRepositoryInterface {
  create(data: AboutTeamMemberCreateData): Promise<Prisma.AboutTeamMemberGetPayload<{}>>;

  findById(id: bigint): Promise<Prisma.AboutTeamMemberGetPayload<{}> | null>;

  findByMemberIdRole(member_id: bigint, role: string): Promise<Prisma.AboutTeamMemberGetPayload<{}> | null>;

  updateById(id: bigint, data: AboutTeamMemberUpdateData): Promise<Prisma.AboutTeamMemberGetPayload<{}>>;

  deleteById(id: bigint): Promise<Prisma.AboutTeamMemberGetPayload<{}>>;

  findManyOrdered(where?: Prisma.AboutTeamMemberWhereInput): Promise<Prisma.AboutTeamMemberGetPayload<{}>[]>;

  findManyPublishedOrdered(): Promise<Prisma.AboutTeamMemberGetPayload<{}>[]>;

  getMaxDisplayOrder(): Promise<number | null>;

  countByIds(ids: bigint[]): Promise<number>;

  updateDisplayOrders(ids: bigint[]): Promise<Prisma.AboutTeamMemberGetPayload<{}>[]>;
}
