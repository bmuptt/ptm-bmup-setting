export interface ExternalUserPayload {
  email: string;
  name: string;
  gender: string;
  birthdate: string;
  role_id: number;
}

export interface MemberExternalData {
  id: number;
  name: string;
  gender: string;
  birthdate: Date;
}

export interface ExternalUserRecord {
  id?: number;
  email?: string | null;
  [key: string]: unknown;
}

