import { Prisma } from '@prisma/client';
import { BlogPostCreateData, BlogPostUpdateData } from '../../model';

export interface BlogPostRepositoryInterface {
  create(data: BlogPostCreateData): Promise<Prisma.BlogPostGetPayload<{}>>;

  findById(id: bigint): Promise<Prisma.BlogPostGetPayload<{}> | null>;

  findBySlug(slug: string): Promise<Prisma.BlogPostGetPayload<{}> | null>;

  updateById(id: bigint, data: BlogPostUpdateData): Promise<Prisma.BlogPostGetPayload<{}>>;

  deleteById(id: bigint): Promise<Prisma.BlogPostGetPayload<{}>>;

  count(where?: Prisma.BlogPostWhereInput): Promise<number>;

  findMany(args: Prisma.BlogPostFindManyArgs): Promise<Prisma.BlogPostGetPayload<{}>[]>;
}
