export interface GalleryItemCreatePayload {
  title: string;
  is_published?: boolean;
}

export interface GalleryItemUpdatePayload extends GalleryItemCreatePayload {
  status_file: '0' | '1';
}

export interface GalleryItemListQuery {
  is_published?: boolean;
}

export interface GalleryItemSortPayload {
  ids: bigint[];
}

export interface GalleryItemCreateData {
  image_url: string;
  title: string;
  display_order: number;
  is_published: boolean;
  created_by: bigint;
  updated_by: bigint;
}

export type GalleryItemUpdateData = Partial<{
  image_url: string;
  title: string;
  is_published: boolean;
  display_order: number;
  updated_by: bigint;
}>;
