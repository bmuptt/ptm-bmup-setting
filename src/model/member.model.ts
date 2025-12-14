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

export interface MemberByIdsParams {
  ids: number[];
  orderField?: 'id' | 'name' | 'username' | 'gender' | 'birthdate' | 'address' | 'phone' | 'active' | 'created_at' | 'updated_at';
  orderDir?: 'asc' | 'desc';
}
