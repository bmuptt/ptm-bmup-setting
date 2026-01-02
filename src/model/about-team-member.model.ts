export interface AboutTeamMemberListItem {
  id: bigint;
  member_id: bigint;
  role: string;
  display_order: number;
  is_published: boolean;
  created_by: bigint;
  updated_by: bigint;
  created_at: Date;
  updated_at: Date;
  member?: AboutTeamMemberMemberData | null;
}

export interface AboutTeamMemberMemberData {
  id: number;
  name: string;
  username: string;
  photo: string | null;
  active: boolean;
}

export interface AboutTeamMemberCreatePayload {
  member_id: bigint;
  role: string;
  is_published?: boolean;
}

export type AboutTeamMemberUpdatePayload = AboutTeamMemberCreatePayload;

export interface AboutTeamMemberSortPayload {
  ids: bigint[];
}

export interface AboutTeamMemberListQuery {
  is_published?: boolean;
}

export interface AboutTeamMemberCreateData {
  member_id: bigint;
  role: string;
  display_order: number;
  is_published: boolean;
  created_by: bigint;
  updated_by: bigint;
}

export type AboutTeamMemberUpdateData = Partial<{
  member_id: bigint;
  role: string;
  is_published: boolean;
  updated_by: bigint;
}>;
