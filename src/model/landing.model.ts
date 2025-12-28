export type LandingSectionKey = 'home' | 'about';

export interface LandingItemInput {
  key: string;
  type?: string | null | undefined;
  title?: string | null | undefined;
  content?: string | null | undefined;
  image_url?: string | null | undefined;
  button_label?: string | null | undefined;
  button_url?: string | null | undefined;
  published: boolean;
  status_image?: '0' | '1';
}

export interface LandingUpsertPayload {
  page_key: LandingSectionKey;
  items: LandingItemInput[];
}

export interface LandingUpsertResultItem {
  id: bigint;
  key: string;
  type: string | null;
  title: string | null;
  content: string | null;
  image_url: string | null;
  button_label: string | null;
  button_url: string | null;
  published: boolean;
  created_by: bigint;
  updated_by: bigint;
}

export interface LandingUpsertGroup {
  page_key: LandingSectionKey;
  items: LandingItemInput[];
}

export interface LandingUpsertMultiPayload {
  sections: LandingUpsertGroup[];
}

export interface LandingFormDataBody {
  sections?: string | LandingUpsertGroup[] | { sections: LandingUpsertGroup[] };
  items?: string | LandingItemInput[];
  page_key?: LandingSectionKey;
}
