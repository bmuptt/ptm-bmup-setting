import { Prisma } from '@prisma/client';

export interface MemberRepositoryInterface {
  findById(id: number): Promise<Prisma.MemberGetPayload<{}> | null>;
  findAll(
    page: number, 
    limit: number, 
    search?: string, 
    orderField?: string, 
    orderDir?: string, 
    active?: string,
    token?: string
  ): Promise<{ data: Prisma.MemberGetPayload<{}>[]; total: number; totalPages: number }>;
  create(data: Prisma.MemberCreateInput): Promise<Prisma.MemberGetPayload<{}>>;
  update(id: number, data: Prisma.MemberUpdateInput): Promise<Prisma.MemberGetPayload<{}>>;
  delete(id: number): Promise<void>;
  findByUsername(username: string): Promise<Prisma.MemberGetPayload<{}> | null>;
  findByUserId(userId: number): Promise<Prisma.MemberGetPayload<{}> | null>;
  loadMore(
    limit: number,
    cursor?: number,
    search?: string,
    token?: string
  ): Promise<{ data: Prisma.MemberGetPayload<{}>[]; nextCursor: number | null; hasMore: boolean }>;
}