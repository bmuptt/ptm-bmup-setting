import prisma from '../config/database';

export class LandingSectionRepository {
  async findByPageKey(page_key: string) {
    return prisma.landingSection.findUnique({
      where: { page_key },
    });
  }
  async findAll() {
    return prisma.landingSection.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async create(data: { page_key: string; created_by: bigint; updated_by: bigint }) {
    return prisma.landingSection.create({ data });
  }

  async ensure(page_key: string, userId: number | undefined) {
    const existing = await this.findByPageKey(page_key);
    if (existing) return existing;
    const actor = BigInt(userId ?? 0);
    return this.create({ page_key, created_by: actor, updated_by: actor });
  }
}

export default new LandingSectionRepository();
