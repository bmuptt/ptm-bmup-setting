export interface IconListItem {
  id: bigint;
  name: string;
  label: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityIconRef {
  id: bigint;
  name: string;
  label: string | null;
  is_active: boolean;
}

export interface ActivityListItem {
  id: bigint;
  icon_id: bigint;
  title: string;
  subtitle: string;
  is_published: boolean;
  sort_order: number | null;
  created_at: Date;
  updated_at: Date;
  icon: ActivityIconRef;
}

export interface ActivityCreatePayload {
  icon_id: bigint;
  title: string;
  subtitle: string;
  is_published?: boolean;
}

export interface ActivityUpdatePayload {
  icon_id: bigint;
  title: string;
  subtitle: string;
  is_published?: boolean;
}

export interface ActivitySortPayload {
  ids: bigint[];
}
