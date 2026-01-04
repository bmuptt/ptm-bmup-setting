export type BlogPostStatus = 'draft' | 'published' | 'not_published';

export interface BlogPostCreatePayload {
  title: string;
  excerpt?: string | null;
  content: string;
  cover_image_url?: string | null;
  status?: BlogPostStatus;
  is_featured?: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image_url?: string | null;
}

export type BlogPostUpdatePayload = Partial<BlogPostCreatePayload> & {
  status_file_cover?: '0' | '1';
  status_file_og_image?: '0' | '1';
};

export interface BlogPostCmsListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: BlogPostStatus;
  is_featured?: boolean;
  order_by?: 'published_at' | 'created_at' | 'updated_at' | 'title';
  order_dir?: 'asc' | 'desc';
}

export interface BlogPostLandingListQuery {
  page?: number;
  limit?: number;
}

export interface BlogPostLandingFeaturedQuery {
  limit?: number;
}

export interface BlogPostCreateData {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: BlogPostStatus;
  published_at: Date | null;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  created_by: bigint;
  updated_by: bigint;
}

export type BlogPostUpdateData = Partial<{
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: BlogPostStatus;
  published_at: Date | null;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  updated_by: bigint;
}>;
