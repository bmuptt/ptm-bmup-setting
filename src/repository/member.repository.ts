import prisma from '../config/database';
import { Prisma, Member } from '@prisma/client';
import { MemberRepositoryInterface } from './contracts/member.repository.interface';
import externalUserRepository from './external-user.repository';

export class MemberRepository implements MemberRepositoryInterface {
  
  /**
   * Get member by ID
   * @param id - Member ID
   * @returns Member data
   */
  async findById(id: number) {
    return await prisma.member.findUnique({
      where: {
        id: id
      }
    });
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
  async findAll(
    page: number, 
    limit: number, 
    search?: string, 
    orderField?: string, 
    orderDir?: string, 
    active?: string,
    token?: string
  ) {
    const skip = (page - 1) * limit;
    
    // Build where clause
    const whereClause: Prisma.MemberWhereInput = {};
    
    // Search by name, username, or phone
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Filter by active status
    if (active && active !== 'all') {
      const isActive = active === 'active';
      whereClause.active = isActive;
    }

    // Build order by clause as array (Prisma requirement)
    const orderBy: Prisma.MemberOrderByWithRelationInput[] = [];
    
    // Apply custom ordering if provided
    if (orderField && orderDir) {
      const validOrderFields = ['id', 'name', 'username', 'gender', 'birthdate', 'address', 'phone', 'active', 'created_at', 'updated_at'];
      const validOrderDirs = ['asc', 'desc'];
      
      if (validOrderFields.includes(orderField) && validOrderDirs.includes(orderDir)) {
        // Map query field names to Prisma field names
        // Prisma TypeScript client converts snake_case to camelCase (e.g., created_at -> createdAt)
        // But we need to check which format Prisma actually uses for this model
        // Using snake_case format to match schema definition
        const prismaFieldName = orderField;
        
        orderBy.push({ [prismaFieldName]: orderDir } as Prisma.MemberOrderByWithRelationInput);
      }
    }
    
    // Always add id desc as secondary sort (rules requirement)
    orderBy.push({ id: 'desc' });

    const [data, total] = await Promise.all([
      prisma.member.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy
      }),
      prisma.member.count({
        where: whereClause
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    const dataWithEmails = await this.attachEmails(data, token);

    return {
      data: dataWithEmails,
      total,
      totalPages
    };
  }

  /**
   * Load more members with cursor-based pagination
   * @param limit - Items per page
   * @param cursor - Cursor for pagination (last item id)
   * @param search - Search term (optional)
   * @returns Paginated members data with next cursor
   */
  async loadMore(
    limit: number,
    cursor?: number,
    search?: string
  ) {
    try {
       // Build where clause
      const whereClause: Prisma.MemberWhereInput = {};
  
      // Search by name, username, or phone
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ];
      }
  
      // Cursor pagination logic
      if (cursor) {
        const cursorMember = await prisma.member.findUnique({
          where: { id: cursor },
          select: { name: true, id: true }
        });

        if (cursorMember) {
          const cursorCondition = {
            OR: [
              { name: { gt: cursorMember.name } },
              {
                name: cursorMember.name,
                id: { lt: cursorMember.id }
              }
            ]
          };

          if (whereClause.OR) {
             whereClause.AND = [
               { OR: whereClause.OR },
               cursorCondition
             ];
             delete whereClause.OR;
          } else {
            Object.assign(whereClause, cursorCondition);
          }
        }
      }
  
      const data = await prisma.member.findMany({
        where: whereClause,
        take: limit + 1, // Fetch one extra to check if there are more
        orderBy: [
          { name: 'asc' },
          { id: 'desc' }
        ]
      });
  
      let hasMore = false;
      let nextCursor: number | null = null;
  
      if (data.length > limit) {
        hasMore = true;
        data.pop(); // Remove the extra item
        nextCursor = data[data.length - 1]?.id ?? null;
      } else if (data.length > 0) {
        nextCursor = data[data.length - 1]?.id ?? null; // Last item id, but hasMore is false so it might not be used
      }
  
      return {
        data: data,
        nextCursor: nextCursor,
        hasMore
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new member
   * @param data - Member data to create
   * @returns Created member data
   */
  async create(data: Prisma.MemberCreateInput) {
    return await prisma.member.create({
      data
    });
  }

  /**
   * Update member
   * @param id - Member ID
   * @param data - Data to update
   * @returns Updated member data
   */
  async update(id: number, data: Prisma.MemberUpdateInput) {
    return await prisma.member.update({
      where: {
        id: id
      },
      data: {
        ...data,
        updated_by: data.updated_by || null
      }
    });
  }

  /**
   * Delete member
   * @param id - Member ID
   */
  async delete(id: number) {
    await prisma.member.delete({
      where: {
        id: id
      }
    });
  }

  /**
   * Find member by username
   * @param username - Username
   * @returns Member data or null
   */
  async findByUsername(username: string) {
    return await prisma.member.findUnique({
      where: {
        username: username
      }
    });
  }

  /**
   * Find member by user ID
   * @param userId - User ID
   * @returns Member data or null
   */
  async findByUserId(userId: number) {
    return await prisma.member.findUnique({
      where: {
        user_id: userId
      }
    });
  }

  private async attachEmails(members: Member[], token?: string): Promise<(Member & { email: string | null })[]> {
    if (!members.length) {
      return members.map((member) => ({ ...member, email: null }));
    }

    const userIds = Array.from(
      new Set(
        members
          .map((member) => member.user_id)
          .filter((id): id is number => typeof id === 'number' && !Number.isNaN(id))
      )
    );

    if (!userIds.length) {
      return members.map((member) => ({ ...member, email: null }));
    }

    // Pass token to external repository for authenticated API calls
    const users = await externalUserRepository.getUsersByIds(userIds, token);
    const emailMap = new Map<number, string>();

    users.forEach((user) => {
      if (typeof user.id === 'number' && user.email) {
        emailMap.set(user.id, String(user.email));
      }
    });

    return members.map((member) => ({
      ...member,
      email: member.user_id ? emailMap.get(member.user_id) ?? null : null,
    }));
  }
}

export default new MemberRepository();











