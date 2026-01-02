import { ResponseError } from '../config/response-error';
import {
  TrainingScheduleCreatePayload,
  TrainingScheduleListQuery,
  TrainingScheduleMemberData,
  TrainingScheduleUpdatePayload,
  TrainingScheduleCreateData,
} from '../model';
import trainingScheduleRepository from '../repository/training-schedule.repository';
import memberRepository from '../repository/member.repository';
import { Prisma } from '@prisma/client';

const pad2 = (value: number) => String(value).padStart(2, '0');

const normalizeTimeString = (value: string) => {
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00`;
  }
  return trimmed;
};

const timeStringToDateUtc = (value: string) => {
  const normalized = normalizeTimeString(value);
  return new Date(`1970-01-01T${normalized}Z`);
};

const dateToTimeStringUtc = (value: Date) => `${pad2(value.getUTCHours())}:${pad2(value.getUTCMinutes())}`;

const mapTrainingSchedule = (schedule: Prisma.TrainingScheduleGetPayload<{}>) => ({
  ...schedule,
  start_time: dateToTimeStringUtc(schedule.start_time),
  end_time: dateToTimeStringUtc(schedule.end_time),
});

export class TrainingScheduleService {
  private safeBigIntToNumber(value: bigint): number | null {
    if (value <= BigInt(Number.MAX_SAFE_INTEGER) && value >= BigInt(0)) {
      return Number(value);
    }
    return null;
  }

  private async attachMemberData(items: { member_id: bigint | null }[]) {
    const memberIds = Array.from(
      new Set(
        items
          .map((i) => (i.member_id ? this.safeBigIntToNumber(i.member_id) : null))
          .filter((n): n is number => typeof n === 'number' && n > 0)
      )
    );

    const members = await memberRepository.findBasicByIds(memberIds);
    const memberMap = new Map<number, TrainingScheduleMemberData | null>();
    members.forEach((m) => memberMap.set(m.id, m));

    return (memberId: bigint | null) => {
      if (!memberId) return null;
      const asNumber = this.safeBigIntToNumber(memberId);
      if (!asNumber) return null;
      return memberMap.get(asNumber) ?? null;
    };
  }

  async createTrainingSchedule(payload: TrainingScheduleCreatePayload, userId: number | undefined) {
    const maxOrder = await trainingScheduleRepository.getMaxDisplayOrder();
    const displayOrder = (maxOrder ?? 0) + 1;

    const actor = BigInt(userId ?? 0);
    const data: TrainingScheduleCreateData = {
      day_of_week: payload.day_of_week,
      start_time: timeStringToDateUtc(payload.start_time),
      end_time: timeStringToDateUtc(payload.end_time),
      category: payload.category,
      member_id: payload.member_id ?? null,
      display_order: displayOrder,
      is_published: payload.is_published ?? false,
      created_by: actor,
      updated_by: actor,
    };

    const created = await trainingScheduleRepository.create(data);
    const memberId = created.member_id ? this.safeBigIntToNumber(created.member_id) : null;
    const member = memberId ? await memberRepository.findBasicById(memberId) : null;
    return {
      success: true,
      data: { ...mapTrainingSchedule(created), member: member ?? null },
      message: 'Training schedule created successfully',
    };
  }

  async listTrainingSchedulesCms(query: TrainingScheduleListQuery) {
    const where = query.is_published === undefined ? undefined : { is_published: query.is_published };
    const schedules = await trainingScheduleRepository.findManyOrdered(where);
    const getMember = await this.attachMemberData(schedules);
    return {
      success: true,
      data: schedules.map((s) => ({ ...mapTrainingSchedule(s), member: getMember(s.member_id) })),
      message: 'Training schedules retrieved successfully',
      count: schedules.length,
    };
  }

  async listTrainingSchedulesLanding() {
    const schedules = await trainingScheduleRepository.findManyPublishedOrdered();
    const getMember = await this.attachMemberData(schedules);
    return {
      success: true,
      data: schedules.map((s) => ({ ...mapTrainingSchedule(s), member: getMember(s.member_id) })),
      message: 'Training schedules retrieved successfully',
      count: schedules.length,
    };
  }

  async detailTrainingSchedule(id: bigint) {
    const schedule = await trainingScheduleRepository.findById(id);
    if (!schedule) {
      throw new ResponseError(404, 'Training schedule not found');
    }
    const memberId = schedule.member_id ? this.safeBigIntToNumber(schedule.member_id) : null;
    const member = memberId ? await memberRepository.findBasicById(memberId) : null;
    return {
      success: true,
      data: { ...mapTrainingSchedule(schedule), member: member ?? null },
      message: 'Training schedule retrieved successfully',
    };
  }

  async sortTrainingSchedules(ids: bigint[]) {
    await trainingScheduleRepository.updateDisplayOrders(ids);
    return {
      success: true,
      message: 'Training schedules sorted successfully',
    };
  }

  async updateTrainingSchedule(
    id: bigint,
    payload: TrainingScheduleUpdatePayload,
    userId: number | undefined,
    existing: Prisma.TrainingScheduleGetPayload<{}>
  ) {
    const actor = BigInt(userId ?? 0);
    const updated = await trainingScheduleRepository.updateById(id, {
      day_of_week: payload.day_of_week,
      start_time: timeStringToDateUtc(payload.start_time),
      end_time: timeStringToDateUtc(payload.end_time),
      category: payload.category,
      member_id: payload.member_id === undefined ? existing.member_id : payload.member_id ?? null,
      is_published: payload.is_published ?? existing.is_published,
      updated_by: actor,
    });

    const memberId = updated.member_id ? this.safeBigIntToNumber(updated.member_id) : null;
    const member = memberId ? await memberRepository.findBasicById(memberId) : null;
    return {
      success: true,
      data: { ...mapTrainingSchedule(updated), member: member ?? null },
      message: 'Training schedule updated successfully',
    };
  }

  async deleteTrainingSchedule(id: bigint) {
    await trainingScheduleRepository.deleteById(id);
    return {
      success: true,
      message: 'Training schedule deleted successfully',
    };
  }
}

export default new TrainingScheduleService();
