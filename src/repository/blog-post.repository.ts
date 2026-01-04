import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { BlogPostCreateData, BlogPostUpdateData } from '../model';
import { BlogPostRepositoryInterface } from './contracts/blog-post.repository.interface';

export class BlogPostRepository implements BlogPostRepositoryInterface {
  async create(data: BlogPostCreateData) {
    return prisma.blogPost.create({ data });
  }

  async findById(id: bigint) {
    return prisma.blogPost.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    return prisma.blogPost.findUnique({
      where: { slug },
    });
  }

  async updateById(id: bigint, data: BlogPostUpdateData) {
    return prisma.blogPost.update({
      where: { id },
      data,
    });
  }

  async deleteById(id: bigint) {
    return prisma.blogPost.delete({
      where: { id },
    });
  }

  async count(where?: Prisma.BlogPostWhereInput) {
    if (where === undefined) {
      return prisma.blogPost.count();
    }
    return prisma.blogPost.count({ where });
  }

  async findMany(args: Prisma.BlogPostFindManyArgs) {
    return prisma.blogPost.findMany(args);
  }
}

export default new BlogPostRepository();
