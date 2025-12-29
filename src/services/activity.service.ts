import activityRepository from '../repository/activity.repository';
import { ActivityCreatePayload, ActivityUpdatePayload } from '../model';
import { ResponseError } from '../config/response-error';

export class ActivityService {
  async createActivity(payload: ActivityCreatePayload) {
    const maxSortOrder = await activityRepository.getMaxSortOrder();
    const sortOrder = (maxSortOrder ?? 0) + 1;

    const created = await activityRepository.create({
      icon_id: payload.icon_id,
      title: payload.title,
      subtitle: payload.subtitle,
      is_published: payload.is_published ?? true,
      sort_order: sortOrder,
    });

    return {
      success: true,
      data: created,
      message: 'Activity created successfully',
    };
  }

  async listActivities() {
    const activities = await activityRepository.findManyWithIconOrdered();
    return {
      success: true,
      data: activities,
      message: 'Activities retrieved successfully',
      count: activities.length,
    };
  }

  async detailActivity(id: bigint) {
    const activity = await activityRepository.findByIdWithIcon(id);
    if (!activity) {
      throw new ResponseError(404, 'Activity not found');
    }
    return {
      success: true,
      data: activity,
      message: 'Activity retrieved successfully',
    };
  }

  async sortActivities(ids: bigint[]) {
    await activityRepository.updateSortOrders(ids);
    return {
      success: true,
      message: 'Activities sorted successfully',
    };
  }

  async updateActivity(id: bigint, payload: ActivityUpdatePayload) {
    const existing = await activityRepository.findById(id);
    if (!existing) {
      throw new ResponseError(404, 'Activity not found');
    }

    const updated = await activityRepository.updateById(id, {
      icon_id: payload.icon_id,
      title: payload.title,
      subtitle: payload.subtitle,
      is_published: payload.is_published ?? existing.is_published,
    });

    return {
      success: true,
      data: updated,
      message: 'Activity updated successfully',
    };
  }

  async deleteActivity(id: bigint) {
    const existing = await activityRepository.findById(id);
    if (!existing) {
      throw new ResponseError(404, 'Activity not found');
    }

    await activityRepository.deleteById(id);
    return {
      success: true,
      message: 'Activity deleted successfully',
    };
  }
}

export default new ActivityService();
