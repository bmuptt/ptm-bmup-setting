export interface AboutTimelineCreatePayload {
  year: number;
  title: string;
  description: string;
  is_published?: boolean;
}

export type AboutTimelineUpdatePayload = AboutTimelineCreatePayload;

export interface AboutTimelineListQuery {
  is_published?: boolean;
}

export interface AboutTimelineCreateData {
  year: number;
  title: string;
  description: string;
  is_published: boolean;
  created_by: bigint;
  updated_by: bigint;
}

export type AboutTimelineUpdateData = Partial<{
  year: number;
  title: string;
  description: string;
  is_published: boolean;
  updated_by: bigint;
}>;
