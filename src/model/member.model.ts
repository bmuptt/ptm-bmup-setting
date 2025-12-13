export interface MemberLoadMoreQuery {
  cursor?: number;
  limit?: number;
  search?: string;
}

export interface MemberLoadMoreResponse<T> {
  data: T[];
  nextCursor: number | null;
  hasMore: boolean;
}

export interface MemberImportRow {
  name: string;
  username: string;
  gender: string;
  birthdate: string | number;
  address: string;
  phone: string | number;
  active?: boolean | string | number;
}
