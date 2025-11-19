import httpClient from '../config/axios';
import { ExternalUserPayload, ExternalUserRecord } from '../model';
import { ExternalUserRepositoryInterface } from './contracts/external-user.repository.interface';

class ExternalUserRepository implements ExternalUserRepositoryInterface {
  async createUser(payload: ExternalUserPayload, token?: string): Promise<unknown> {
    // Include token in Cookie header if provided
    // Format: Cookie: token=<value> (for httpOnly and secure cookies)
    const headers: Record<string, string> = {};
    if (token && typeof token === 'string' && token.trim()) {
      headers['Cookie'] = `token=${token}`;
      
      // Token is being forwarded to external service (APM will track this)
    } else {
      // No token provided (APM will capture if this causes errors)
    }

    const response = await httpClient.post('/app-management/user', payload, {
      headers,
    });
    return response?.data ?? response;
  }

  async getUsersByIds(userIds: number[], token?: string): Promise<ExternalUserRecord[]> {
    // Include token in Cookie header if provided
    // Format: Cookie: token=<value> (for httpOnly and secure cookies)
    const headers: Record<string, string> = {};
    if (token && typeof token === 'string' && token.trim()) {
      headers['Cookie'] = `token=${token}`;
      
      // Token is being forwarded to external service (APM will track this)
    } else {
      // No token provided (APM will capture if this causes errors)
    }

    const response = await httpClient.get('/app-management/user/get-email', {
      params: {
        ids: userIds.join(','),
      },
      headers,
    });

    return this.extractUsers(response);
  }

  private extractUsers(response: unknown): ExternalUserRecord[] {
    if (!response) {
      return [];
    }

    if (Array.isArray(response)) {
      return response;
    }

    const data = (response as { data?: unknown }).data;

    if (Array.isArray(data)) {
      return data;
    }

    const nestedUsers = (data as { users?: unknown })?.users;
    if (Array.isArray(nestedUsers)) {
      return nestedUsers;
    }

    const directUsers = (response as { users?: unknown }).users;
    if (Array.isArray(directUsers)) {
      return directUsers;
    }

    return [];
  }
}

export default new ExternalUserRepository();
