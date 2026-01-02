import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { AboutTeamMemberCreateData, AboutTeamMemberUpdateData } from '../model';
import { AboutTeamMemberRepositoryInterface } from './contracts/about-team-member.repository.interface';

export class AboutTeamMemberRepository implements AboutTeamMemberRepositoryInterface {
  async create(data: AboutTeamMemberCreateData) {
    return prisma.aboutTeamMember.create({ data });
  }

  async findById(id: bigint) {
    return prisma.aboutTeamMember.findUnique({
      where: { id },
    });
  }

  async findByMemberIdRole(member_id: bigint, role: string) {
    return prisma.aboutTeamMember.findUnique({
      where: {
        member_id_role: {
          member_id,
          role,
        },
      },
    });
  }

  async updateById(id: bigint, data: AboutTeamMemberUpdateData) {
    return prisma.aboutTeamMember.update({
      where: { id },
      data,
    });
  }

  async deleteById(id: bigint) {
    return prisma.aboutTeamMember.delete({
      where: { id },
    });
  }

  async findManyOrdered(where?: Prisma.AboutTeamMemberWhereInput) {
    const args: Prisma.AboutTeamMemberFindManyArgs = {
      orderBy: [{ display_order: 'asc' }, { id: 'desc' }],
    };
    if (where !== undefined) {
      args.where = where;
    }
    return prisma.aboutTeamMember.findMany(args);
  }

  async findManyPublishedOrdered() {
    return this.findManyOrdered({ is_published: true });
  }

  async getMaxDisplayOrder() {
    const agg = await prisma.aboutTeamMember.aggregate({
      _max: { display_order: true },
    });
    return agg._max.display_order ?? null;
  }

  async countByIds(ids: bigint[]) {
    return prisma.aboutTeamMember.count({
      where: { id: { in: ids } },
    });
  }

  async updateDisplayOrders(ids: bigint[]) {
    return prisma.$transaction(
      ids.map((id, index) =>
        prisma.aboutTeamMember.update({
          where: { id },
          data: { display_order: index + 1 },
        })
      )
    );
  }
}

export default new AboutTeamMemberRepository();
