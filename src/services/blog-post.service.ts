import { Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { config } from '../config/environment';
import { ResponseError } from '../config/response-error';
import { sanitizeHtml } from '../helper/html-sanitize.helper';
import {
  BlogPostCmsListQuery,
  BlogPostCreatePayload,
  BlogPostLandingFeaturedQuery,
  BlogPostLandingListQuery,
  BlogPostStatus,
  BlogPostUpdateData,
  BlogPostUpdatePayload,
} from '../model';
import blogPostRepository from '../repository/blog-post.repository';

const normalizeSlugSource = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const slugify = (value: string) => {
  const normalized = normalizeSlugSource(value);
  const replaced = normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const base = replaced.length > 0 ? replaced : 'post';
  return base.slice(0, 200);
};

const clampInt = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const getStorageFilePathFromUrl = (url: string) => {
  const marker = '/storage/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const rel = url.substring(idx + marker.length).split('?')[0]?.split('#')[0]?.trim();
  if (!rel) return null;
  const parts = rel.split('/').filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.some((p) => p === '.' || p === '..')) return null;
  const filePath = path.join(process.cwd(), 'storage', ...parts);
  const storageRoot = path.join(process.cwd(), 'storage');
  if (!filePath.startsWith(storageRoot)) return null;
  return filePath;
};

const tryDeleteStorageFileByUrl = (url: string | null | undefined) => {
  if (!url) return;
  const filePath = getStorageFilePathFromUrl(url);
  if (!filePath) return;
  if (!fs.existsSync(filePath)) return;
  try {
    fs.unlinkSync(filePath);
  } catch {}
};

const tryDeleteUploadedFile = (file: Express.Multer.File | undefined) => {
  if (!file) return;
  const storageRoot = path.join(process.cwd(), 'storage');
  const filePath = path.resolve(file.path);
  if (!filePath.startsWith(storageRoot)) return;
  if (!fs.existsSync(filePath)) return;
  try {
    fs.unlinkSync(filePath);
  } catch {}
};

export class BlogPostService {
  private async ensureUniqueSlug(desiredSlug: string, excludeId?: bigint) {
    const base = desiredSlug.slice(0, 200);

    let candidate = base;
    for (let i = 0; i < 200; i++) {
      const existing = await blogPostRepository.findBySlug(candidate);
      if (!existing || (excludeId && existing.id === excludeId)) {
        return candidate;
      }

      const suffix = `-${i + 2}`;
      const maxBaseLength = 200 - suffix.length;
      candidate = `${base.slice(0, Math.max(1, maxBaseLength))}${suffix}`;
    }

    throw new ResponseError(500, 'Failed to generate unique slug');
  }

  async createBlogPost(
    payload: BlogPostCreatePayload,
    userId: number | undefined,
    files?: Record<string, Express.Multer.File[]>
  ) {
    const actor = BigInt(userId ?? 0);
    const status: BlogPostStatus = payload.status ?? 'draft';
    const publishedAt = status === 'published' ? new Date() : null;

    const desiredSlug = slugify(payload.title);
    const uniqueSlug = await this.ensureUniqueSlug(desiredSlug);

    const coverFile = files?.cover?.[0];
    const ogImageFile = files?.og_image?.[0];

    const coverImageUrl = coverFile
      ? `${config.APP_URL}/storage/images/blog/covers/${coverFile.filename}`
      : (payload.cover_image_url ?? null);

    const ogImageUrl = ogImageFile
      ? `${config.APP_URL}/storage/images/blog/og-images/${ogImageFile.filename}`
      : (payload.og_image_url ?? null);

    const created = await blogPostRepository.create({
      slug: uniqueSlug,
      title: payload.title,
      excerpt: payload.excerpt ?? null,
      content: sanitizeHtml(payload.content),
      cover_image_url: coverImageUrl,
      status,
      published_at: publishedAt,
      is_featured: payload.is_featured ?? false,
      meta_title: payload.meta_title ?? null,
      meta_description: payload.meta_description ?? null,
      og_image_url: ogImageUrl,
      created_by: actor,
      updated_by: actor,
    });

    return {
      success: true,
      data: created,
      message: 'Blog post created successfully',
    };
  }

  async listBlogPostsCms(query: BlogPostCmsListQuery) {
    const page = clampInt(query.page ?? 1, 1, 1_000_000);
    const limit = clampInt(query.limit ?? 10, 1, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.is_featured !== undefined) {
      where.is_featured = query.is_featured;
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { excerpt: { contains: term, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.BlogPostOrderByWithRelationInput[] = [];
    const orderDir = query.order_dir ?? 'desc';
    const orderByField = query.order_by ?? 'created_at';

    if (orderByField === 'title') {
      orderBy.push({ title: orderDir });
    } else if (orderByField === 'published_at') {
      orderBy.push({ published_at: orderDir });
    } else if (orderByField === 'updated_at') {
      orderBy.push({ updated_at: orderDir });
    } else {
      orderBy.push({ created_at: orderDir });
    }

    orderBy.push({ id: 'desc' });

    const [total, items] = await Promise.all([
      blogPostRepository.count(where),
      blogPostRepository.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return {
      success: true,
      data: items,
      message: 'Blog posts retrieved successfully',
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async detailBlogPostCms(id: bigint) {
    const post = await blogPostRepository.findById(id);
    if (!post) {
      throw new ResponseError(404, 'Blog post not found');
    }
    return {
      success: true,
      data: post,
      message: 'Blog post retrieved successfully',
    };
  }

  async updateBlogPost(
    id: bigint,
    payload: BlogPostUpdatePayload,
    userId: number | undefined,
    existing: Prisma.BlogPostGetPayload<{}>,
    files?: Record<string, Express.Multer.File[]>
  ) {
    const actor = BigInt(userId ?? 0);
    const updateData: BlogPostUpdateData = {
      updated_by: actor,
    };

    if (payload.title !== undefined) {
      updateData.title = payload.title;
      const desiredSlug = slugify(payload.title);
      if (desiredSlug !== existing.slug) {
        updateData.slug = await this.ensureUniqueSlug(desiredSlug, id);
      }
    }

    if (payload.excerpt !== undefined) {
      updateData.excerpt = payload.excerpt;
    }

    if (payload.content !== undefined) {
      updateData.content = sanitizeHtml(payload.content);
    }

    const coverFile = files?.cover?.[0];
    const ogImageFile = files?.og_image?.[0];
    const statusCover = parseInt(payload.status_file_cover ?? '0');
    const statusOgImage = parseInt(payload.status_file_og_image ?? '0');

    if (statusCover === 1) {
      if (coverFile) {
        tryDeleteStorageFileByUrl(existing.cover_image_url);
        updateData.cover_image_url = `${config.APP_URL}/storage/images/blog/covers/${coverFile.filename}`;
      } else {
        tryDeleteStorageFileByUrl(existing.cover_image_url);
        updateData.cover_image_url = null;
      }
    } else {
      if (coverFile) {
        tryDeleteUploadedFile(coverFile);
      }
      if (payload.cover_image_url !== undefined && payload.cover_image_url !== null) {
        if (payload.cover_image_url !== existing.cover_image_url) {
          tryDeleteStorageFileByUrl(existing.cover_image_url);
        }
        updateData.cover_image_url = payload.cover_image_url;
      }
    }

    if (payload.is_featured !== undefined) {
      updateData.is_featured = payload.is_featured;
    }

    if (payload.meta_title !== undefined) {
      updateData.meta_title = payload.meta_title;
    }

    if (payload.meta_description !== undefined) {
      updateData.meta_description = payload.meta_description;
    }

    if (statusOgImage === 1) {
      if (ogImageFile) {
        tryDeleteStorageFileByUrl(existing.og_image_url);
        updateData.og_image_url = `${config.APP_URL}/storage/images/blog/og-images/${ogImageFile.filename}`;
      } else {
        tryDeleteStorageFileByUrl(existing.og_image_url);
        updateData.og_image_url = null;
      }
    } else {
      if (ogImageFile) {
        tryDeleteUploadedFile(ogImageFile);
      }
      if (payload.og_image_url !== undefined && payload.og_image_url !== null) {
        if (payload.og_image_url !== existing.og_image_url) {
          tryDeleteStorageFileByUrl(existing.og_image_url);
        }
        updateData.og_image_url = payload.og_image_url;
      }
    }

    if (payload.status !== undefined) {
      updateData.status = payload.status;

      if (payload.status === 'published') {
        if (existing.status !== 'published' || !existing.published_at) {
          updateData.published_at = new Date();
        }
      } else {
        updateData.published_at = null;
      }
    }

    const updated = await blogPostRepository.updateById(id, updateData);

    return {
      success: true,
      data: updated,
      message: 'Blog post updated successfully',
    };
  }

  async deleteBlogPost(id: bigint) {
    const existing = await blogPostRepository.findById(id);
    if (existing) {
      tryDeleteStorageFileByUrl(existing.cover_image_url);
      tryDeleteStorageFileByUrl(existing.og_image_url);
    }
    await blogPostRepository.deleteById(id);
    return {
      success: true,
      message: 'Blog post deleted successfully',
    };
  }

  async publishBlogPost(id: bigint, userId: number | undefined, existing: Prisma.BlogPostGetPayload<{}>) {
    const actor = BigInt(userId ?? 0);
    const updateData: BlogPostUpdateData = {
      status: 'published',
      published_at: existing.status === 'published' && existing.published_at ? existing.published_at : new Date(),
      updated_by: actor,
    };

    const updated = await blogPostRepository.updateById(id, updateData);
    return {
      success: true,
      data: updated,
      message: 'Blog post published successfully',
    };
  }

  async unpublishBlogPost(id: bigint, userId: number | undefined) {
    const actor = BigInt(userId ?? 0);
    const updateData: BlogPostUpdateData = {
      status: 'not_published',
      published_at: null,
      updated_by: actor,
    };

    const updated = await blogPostRepository.updateById(id, updateData);
    return {
      success: true,
      data: updated,
      message: 'Blog post unpublished successfully',
    };
  }

  async listBlogPostsLanding(query: BlogPostLandingListQuery) {
    const page = clampInt(query.page ?? 1, 1, 1_000_000);
    const limit = clampInt(query.limit ?? 10, 1, 50);
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = { status: 'published' };

    const [total, items] = await Promise.all([
      blogPostRepository.count(where),
      blogPostRepository.findMany({
        where,
        orderBy: [{ published_at: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      success: true,
      data: items,
      message: 'Blog posts retrieved successfully',
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async listBlogPostsFeaturedLanding(query: BlogPostLandingFeaturedQuery) {
    const limit = clampInt(query.limit ?? 10, 1, 50);

    const items = await blogPostRepository.findMany({
      where: { status: 'published', is_featured: true },
      orderBy: [{ published_at: 'desc' }, { id: 'desc' }],
      take: limit,
    });

    return {
      success: true,
      data: items,
      message: 'Featured blog posts retrieved successfully',
      count: items.length,
    };
  }

  async detailBlogPostLanding(slug: string) {
    const post = await blogPostRepository.findBySlug(slug);
    if (!post || post.status !== 'published') {
      throw new ResponseError(404, 'Blog post not found');
    }
    return {
      success: true,
      data: post,
      message: 'Blog post retrieved successfully',
    };
  }
}

export default new BlogPostService();
