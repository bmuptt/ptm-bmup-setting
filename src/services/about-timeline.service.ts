import { ResponseError } from '../config/response-error';
import { AboutTimelineCreatePayload, AboutTimelineUpdatePayload } from '../model';
import aboutTimelineRepository from '../repository/about-timeline.repository';

export class AboutTimelineService {
  async createAboutTimeline(payload: AboutTimelineCreatePayload, userId: number | undefined) {
    const actor = BigInt(userId ?? 0);
    const created = await aboutTimelineRepository.create({
      year: payload.year,
      title: payload.title,
      description: payload.description,
      is_published: payload.is_published ?? true,
      created_by: actor,
      updated_by: actor,
    });

    return {
      success: true,
      data: created,
      message: 'About timeline created successfully',
    };
  }

  async listAboutTimelinesLanding() {
    const timelines = await aboutTimelineRepository.findManyPublishedOrdered();
    return {
      success: true,
      data: timelines,
      message: 'About timelines retrieved successfully',
      count: timelines.length,
    };
  }

  async listAboutTimelinesCms(query: { is_published?: boolean }) {
    const where = query.is_published === undefined ? undefined : { is_published: query.is_published };
    const timelines = await aboutTimelineRepository.findManyOrdered(where);
    return {
      success: true,
      data: timelines,
      message: 'About timelines retrieved successfully',
      count: timelines.length,
    };
  }

  async detailAboutTimeline(id: bigint) {
    const timeline = await aboutTimelineRepository.findById(id);
    if (!timeline) {
      throw new ResponseError(404, 'About timeline not found');
    }
    return {
      success: true,
      data: timeline,
      message: 'About timeline retrieved successfully',
    };
  }

  async updateAboutTimeline(id: bigint, payload: AboutTimelineUpdatePayload, userId: number | undefined) {
    const existing = await aboutTimelineRepository.findById(id);
    if (!existing) {
      throw new ResponseError(404, 'About timeline not found');
    }

    const actor = BigInt(userId ?? 0);
    const updated = await aboutTimelineRepository.updateById(id, {
      year: payload.year,
      title: payload.title,
      description: payload.description,
      is_published: payload.is_published ?? existing.is_published,
      updated_by: actor,
    });

    return {
      success: true,
      data: updated,
      message: 'About timeline updated successfully',
    };
  }

  async deleteAboutTimeline(id: bigint) {
    const existing = await aboutTimelineRepository.findById(id);
    if (!existing) {
      throw new ResponseError(404, 'About timeline not found');
    }

    await aboutTimelineRepository.deleteById(id);
    return {
      success: true,
      message: 'About timeline deleted successfully',
    };
  }
}

export default new AboutTimelineService();
