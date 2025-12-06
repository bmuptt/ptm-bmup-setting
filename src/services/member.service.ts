import memberRepository from '../repository/member.repository';
import fs from 'fs';
import path from 'path';
import { config } from '../config/environment';
import { ResponseError } from '../config/response-error';
import { Prisma } from '@prisma/client';
import externalUserRepository from '../repository/external-user.repository';
import { ExternalUserPayload, MemberExternalData, ExternalUserRecord } from '../model';

export class MemberService {
  /**
   * Get member by ID
   * @param id - Member ID (member already validated in middleware)
   * @returns Member data
   */
  async getMemberById(id: number) {
    const member = await memberRepository.findById(id);

    // Member existence already validated in validation middleware
    return {
      success: true,
      data: member,
      message: 'Member retrieved successfully',
    };
  }

  /**
   * Get all members with pagination, search, filtering, and custom ordering
   * @param page - Page number
   * @param limit - Items per page
   * @param search - Search term (optional)
   * @param orderField - Field to order by (optional)
   * @param orderDir - Order direction: 'asc' or 'desc' (optional)
   * @param active - Filter by active status: 'active', 'inactive', or 'all' (optional)
   * @param token - Authentication token (optional, for forwarding to external service)
   * @returns Paginated members data
   */
  async getAllMembers(
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    orderField?: string, 
    orderDir?: string, 
    active?: string,
    token?: string
  ) {
    const result = await memberRepository.findAll(page, limit, search, orderField, orderDir, active, token);

    return {
      success: true,
      data: result.data,
      pagination: {
        currentPage: page,
        totalPages: result.totalPages,
        totalItems: result.total,
        itemsPerPage: limit,
      },
      message: 'Members retrieved successfully',
    };
  }

  /**
   * Load more members with cursor-based pagination
   * @param limit - Items per page
   * @param cursor - Cursor for pagination
   * @param search - Search term (optional)
   * @returns Paginated members data with next cursor
   */
  async loadMoreMembers(
    limit: number,
    cursor?: number,
    search?: string
  ) {
    const result = await memberRepository.loadMore(limit, cursor, search);

    return {
      success: true,
      data: result.data,
      meta: {
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
        limit
      },
      message: 'Members retrieved successfully',
    };
  }

  /**
   * Create new member
   * @param data - Member data to create
   * @param file - Uploaded photo file (optional)
   * @param userId - User ID for audit trail
   * @returns Created member data
   */
  async createMember(
    data: {
      user_id?: number | null;
      name: string;
      username: string;
      gender: string;
      birthdate: string;
      address: string;
      phone: string;
      photo?: string | null;
      active: boolean | string;
    },
    file?: Express.Multer.File,
    userId?: number
  ) {
    // Handle photo upload
    let photoFileName = null;
    if (file) {
      photoFileName = `${config.APP_URL}/storage/images/members/${file.filename}`;
    }

    // Convert active field to boolean if it's a string or number
    let activeValue: boolean = false;
    if (typeof data.active === 'string') {
      activeValue = data.active === 'true' || data.active === '1';
    } else if (typeof data.active === 'number') {
      activeValue = data.active === 1;
    } else {
      activeValue = data.active;
    }

    // Prepare member data
    const memberData = {
      user_id: data.user_id || null,
      name: data.name,
      username: data.username,
      gender: data.gender,
      birthdate: new Date(data.birthdate),
      address: data.address,
      phone: data.phone,
      photo: photoFileName,
      active: activeValue,
      created_by: userId || 0,
      updated_by: null,
    };

    const createdMember = await memberRepository.create(memberData);

    return {
      success: true,
      data: createdMember,
      message: 'Member created successfully',
    };
  }

  /**
   * Update member
   * @param id - Member ID
   * @param data - Member data to update
   * @param file - Uploaded photo file (optional)
   * @param userId - User ID for audit trail
   * @returns Updated member data
   */
  async updateMember(
    id: number,
    data: {
      user_id?: number | null;
      name: string;
      username: string;
      gender: string;
      birthdate: string;
      address: string;
      phone: string;
      photo?: string | null;
      active?: boolean;
      status_file?: string;
    },
    file?: Express.Multer.File,
    userId?: number
  ) {
    // Get existing member for photo handling
    // Member existence already validated in validation middleware
    const existingMember = await memberRepository.findById(id);
    
    // Non-null assertion: member is guaranteed to exist (validated in validation middleware)

    // Handle photo upload based on status_file
    let photoFileName = existingMember!.photo; // Default: keep existing
    
    // Handle file upload logic based on status_file
    const statusFile = parseInt(data.status_file || '0');
    
    if (statusFile === 1) {
      // status_file = 1: ada perubahan file
      if (file) {
        // Delete old photo if exists
        if (existingMember!.photo) {
          const oldPhotoFilename = existingMember!.photo.split('/').pop();
          if (oldPhotoFilename) {
            const oldPhotoPath = path.join(
              process.cwd(),
              'storage',
              'images',
              'members',
              oldPhotoFilename
            );
            if (fs.existsSync(oldPhotoPath)) {
              fs.unlinkSync(oldPhotoPath);
            }
          }
        }
        // Store new photo as full URL
        photoFileName = `${config.APP_URL}/storage/images/members/${file.filename}`;
      } else {
        // status_file = 1 but no file = remove photo
        if (existingMember!.photo) {
          const oldPhotoFilename = existingMember!.photo.split('/').pop();
          if (oldPhotoFilename) {
            const oldPhotoPath = path.join(
              process.cwd(),
              'storage',
              'images',
              'members',
              oldPhotoFilename
            );
            if (fs.existsSync(oldPhotoPath)) {
              fs.unlinkSync(oldPhotoPath);
            }
          }
        }
        photoFileName = null;
      }
    }
    // status_file = 0: no change - keep existing photo

    // Remove status_file and _method from update data
    const { status_file: statusFileField, ...finalUpdateData } = data;

    // Prepare update data
    const updateData: Prisma.MemberUpdateInput = {
      ...finalUpdateData,
      photo: photoFileName,
      updated_by: userId || 0,
    };

    // Convert birthdate string to Date (required field)
    updateData.birthdate = new Date(data.birthdate);

    const updatedMember = await memberRepository.update(id, updateData);

    return {
      success: true,
      data: updatedMember,
      message: 'Member updated successfully',
    };
  }

  /**
   * Delete member
   * @param id - Member ID
   * @returns Success message
   */
  async deleteMember(id: number) {
    // Get member for photo cleanup
    const existingMember = await memberRepository.findById(id);
    
    // Delete photo file if exists
    if (existingMember && existingMember.photo) {
      const photoFilename = existingMember.photo.split('/').pop();
      if (photoFilename) {
        const photoPath = path.join(
          process.cwd(),
          'storage',
          'images',
          'members',
          photoFilename
        );
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }
    }

    await memberRepository.delete(id);

    return {
      success: true,
      message: 'Member deleted successfully',
    };
  }

  /**
   * Create external user for a member
   * @param member - Member entity (validated)
   * @param data - Payload containing email and role_id
   * @param token - Authentication token (optional, for forwarding to external service)
   */
  async createMemberUser(
    member: MemberExternalData,
    data: {
      email: string;
      role_id: number;
    },
    token?: string
  ) {
    const birthdateString = member.birthdate.toISOString().split('T')[0]!;

    const payload: ExternalUserPayload = {
      email: data.email,
      name: member.name,
      gender: member.gender,
      birthdate: birthdateString,
      role_id: data.role_id,
    };

    // Pass token to repository so it can be forwarded to external service
    const responseData = await externalUserRepository.createUser(payload, token);
    const { message: externalMessage, userRecord } = this.normalizeExternalUserResponse(responseData);
    const sanitizedUser = userRecord ? this.sanitizeExternalUser(userRecord) : undefined;

    const externalUserId = this.extractExternalUserId(userRecord ?? responseData);

    if (externalUserId) {
      await memberRepository.update(member.id, {
        user_id: externalUserId,
      });
    }

    return {
      success: true,
      data: sanitizedUser ?? responseData,
      message: externalMessage ?? 'External user created successfully',
    };
  }

  private normalizeExternalUserResponse(response: unknown): {
    message?: string;
    userRecord?: ExternalUserRecord;
  } {
    if (!response || typeof response !== 'object' || Array.isArray(response)) {
      return {};
    }

    const responseObj = response as {
      message?: unknown;
      data?: unknown;
      user?: unknown;
    };

    const result: {
      message?: string;
      userRecord?: ExternalUserRecord;
    } = {};

    if (typeof responseObj.message === 'string') {
      result.message = responseObj.message;
    }

    if (responseObj.data && typeof responseObj.data === 'object' && !Array.isArray(responseObj.data)) {
      result.userRecord = responseObj.data as ExternalUserRecord;
      return result;
    }

    if (responseObj.user && typeof responseObj.user === 'object' && !Array.isArray(responseObj.user)) {
      result.userRecord = responseObj.user as ExternalUserRecord;
      return result;
    }

    result.userRecord = response as ExternalUserRecord;
    return result;
  }

  private sanitizeExternalUser(record: ExternalUserRecord): ExternalUserRecord {
    const { password, ...safe } = record;
    return { ...safe };
  }

  private extractExternalUserId(response: unknown): number | null {
    if (!response) {
      return null;
    }

    const tryGetId = (value: unknown): number | null => {
      if (!value || typeof value !== 'object') {
        return null;
      }
      const maybeId = (value as { id?: unknown }).id;
      return typeof maybeId === 'number' ? maybeId : null;
    };

    return (
      tryGetId(response) ||
      (response && typeof response === 'object'
        ? tryGetId((response as { data?: unknown }).data) ||
          tryGetId((response as { user?: unknown }).user)
        : null)
    );
  }
}

export default new MemberService();