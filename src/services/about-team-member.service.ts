import { ResponseError } from '../config/response-error';
import {
  AboutTeamMemberCreatePayload,
  AboutTeamMemberUpdatePayload,
  AboutTeamMemberListQuery,
} from '../model';
import aboutTeamMemberRepository from '../repository/about-team-member.repository';
import memberRepository from '../repository/member.repository';
import { Prisma } from '@prisma/client';

export class AboutTeamMemberService {
  private safeBigIntToNumber(value: bigint): number | null {
    if (value <= BigInt(Number.MAX_SAFE_INTEGER) && value >= BigInt(0)) {
      return Number(value);
    }
    return null;
  }

  private async attachMemberData(items: { member_id: bigint }[]) {
    const memberIds = Array.from(
      new Set(
        items
          .map((i) => this.safeBigIntToNumber(i.member_id))
          .filter((n): n is number => typeof n === 'number' && n > 0)
      )
    );

    const members = await memberRepository.findBasicByIds(memberIds);
    const memberMap = new Map<number, (typeof members)[number]>();
    members.forEach((m) => memberMap.set(m.id, m));

    return (memberId: bigint) => {
      const asNumber = this.safeBigIntToNumber(memberId);
      if (!asNumber) return null;
      return memberMap.get(asNumber) ?? null;
    };
  }

  async createAboutTeamMember(payload: AboutTeamMemberCreatePayload, userId: number | undefined) {
    const maxOrder = await aboutTeamMemberRepository.getMaxDisplayOrder();
    const displayOrder = (maxOrder ?? 0) + 1;

    const actor = BigInt(userId ?? 0);
    const created = await aboutTeamMemberRepository.create({
      member_id: payload.member_id,
      role: payload.role,
      display_order: displayOrder,
      is_published: payload.is_published ?? true,
      created_by: actor,
      updated_by: actor,
    });

    return {
      success: true,
      data: created,
      message: 'About team member created successfully',
    };
  }

  async listAboutTeamMembersCms(query: AboutTeamMemberListQuery) {
    const where = query.is_published === undefined ? undefined : { is_published: query.is_published };
    const members = await aboutTeamMemberRepository.findManyOrdered(where);
    const getMember = await this.attachMemberData(members);
    return {
      success: true,
      data: members.map((m) => ({ ...m, member: getMember(m.member_id) })),
      message: 'About team members retrieved successfully',
      count: members.length,
    };
  }

  async listAboutTeamMembersLanding() {
    const members = await aboutTeamMemberRepository.findManyPublishedOrdered();
    const getMember = await this.attachMemberData(members);
    return {
      success: true,
      data: members.map((m) => ({ ...m, member: getMember(m.member_id) })),
      message: 'About team members retrieved successfully',
      count: members.length,
    };
  }

  async detailAboutTeamMember(id: bigint) {
    const member = await aboutTeamMemberRepository.findById(id);
    if (!member) {
      throw new ResponseError(404, 'About team member not found');
    }
    const memberId = this.safeBigIntToNumber(member.member_id);
    const memberData = memberId ? await memberRepository.findBasicById(memberId) : null;
    return {
      success: true,
      data: { ...member, member: memberData ?? null },
      message: 'About team member retrieved successfully',
    };
  }

  async sortAboutTeamMembers(ids: bigint[]) {
    await aboutTeamMemberRepository.updateDisplayOrders(ids);
    return {
      success: true,
      message: 'About team members sorted successfully',
    };
  }

  async updateAboutTeamMember(
    id: bigint,
    payload: AboutTeamMemberUpdatePayload,
    userId: number | undefined,
    existing: Prisma.AboutTeamMemberGetPayload<{}>
  ) {
    const actor = BigInt(userId ?? 0);
    const updated = await aboutTeamMemberRepository.updateById(id, {
      member_id: payload.member_id,
      role: payload.role,
      is_published: payload.is_published ?? existing.is_published,
      updated_by: actor,
    });

    return {
      success: true,
      data: updated,
      message: 'About team member updated successfully',
    };
  }

  async deleteAboutTeamMember(id: bigint) {
    await aboutTeamMemberRepository.deleteById(id);
    return {
      success: true,
      message: 'About team member deleted successfully',
    };
  }
}

export default new AboutTeamMemberService();
