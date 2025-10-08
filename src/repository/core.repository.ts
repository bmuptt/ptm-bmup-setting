import prisma from '../config/database';
import { CoreRepositoryInterface } from './contracts/core.repository.interface';

export class CoreRepository implements CoreRepositoryInterface {
  
  /**
   * Get core configuration by ID
   * @param id - Core ID (always 0)
   * @returns Core configuration data
   */
  async findById(id: number) {
    return await prisma.core.findFirst({
      where: {
        id: id
      }
    });
  }

  /**
   * Update core configuration
   * @param id - Core ID (always 0)
   * @param data - Data to update
   * @returns Updated core data
   */
  async update(id: number, data: {
    name?: string;
    logo?: string | null;
    description?: string;
    address?: string;
    maps?: string | null;
    primaryColor?: string;
    secondaryColor?: string;
    updatedBy?: number;
  }) {
    return await prisma.core.update({
      where: {
        id: id
      },
      data: {
        ...data,
        updatedBy: data.updatedBy || 0
      }
    });
  }

  /**
   * Create core configuration
   * @param data - Core data to create
   * @returns Created core data
   */
  async create(data: {
    id: number;
    name: string;
    logo?: string | null;
    description: string;
    address: string;
    maps?: string | null;
    primaryColor: string;
    secondaryColor: string;
    createdBy: number;
    updatedBy?: number | null;
  }) {
    return await prisma.core.create({
      data
    });
  }

  /**
   * Delete core configuration
   * @param id - Core ID (always 0)
   * @returns Deleted core data
   */
  async delete(id: number) {
    return await prisma.core.delete({
      where: {
        id: id
      }
    });
  }
}

export default new CoreRepository();
