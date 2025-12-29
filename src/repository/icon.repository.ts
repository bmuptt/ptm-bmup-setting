import prisma from '../config/database';
import { IconRepositoryInterface } from './contracts/icon.repository.interface';

export class IconRepository implements IconRepositoryInterface {
  async findManyActive() {
    return prisma.icon.findMany({
      where: { is_active: true },
      orderBy: { id: 'asc' },
    });
  }

  async findActiveById(id: bigint) {
    return prisma.icon.findFirst({
      where: { id, is_active: true },
    });
  }
}

export default new IconRepository();
