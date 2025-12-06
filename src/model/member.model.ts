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
