export interface TrainingScheduleCreatePayload {
  day_of_week: number;
  start_time: string;
  end_time: string;
  category: string;
  member_id?: bigint | null;
  is_published?: boolean;
}

export type TrainingScheduleUpdatePayload = TrainingScheduleCreatePayload;

export interface TrainingScheduleListQuery {
  is_published?: boolean;
}

export interface TrainingScheduleSortPayload {
  ids: bigint[];
}

export interface TrainingScheduleCreateData {
  day_of_week: number;
  start_time: Date;
  end_time: Date;
  category: string;
  member_id: bigint | null;
  display_order: number;
  is_published: boolean;
  created_by: bigint;
  updated_by: bigint;
}

export type TrainingScheduleUpdateData = Partial<{
  day_of_week: number;
  start_time: Date;
  end_time: Date;
  category: string;
  member_id: bigint | null;
  is_published: boolean;
  display_order: number;
  updated_by: bigint;
}>;

export interface TrainingScheduleMemberData {
  id: number;
  name: string;
  username: string;
  photo: string | null;
  active: boolean;
}
