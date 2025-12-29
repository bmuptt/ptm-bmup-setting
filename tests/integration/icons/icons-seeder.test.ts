import { TestHelper } from '../../test-util';
import prisma from '../../../src/config/database';
import { seedIcons } from '../../../seed/icons-seeder';

describe('Icons Seeder Integration Tests', () => {
  beforeEach(async () => {
    await TestHelper.refreshDatabase();
  });

  afterAll(async () => {
    await TestHelper.cleanupAll();
  });

  it('Should seed required icons and be idempotent', async () => {
    const seeded = await seedIcons();
    await seedIcons();

    const icons = await prisma.icon.findMany({ orderBy: { id: 'asc' } });
    const names = icons.map((i) => i.name).sort();
    const expected = seeded.map((i) => i.name).sort();

    expect(icons.length).toBe(expected.length);
    expect(names).toEqual(expected);
    expect(names).toContain('mdi-table-tennis');
    expect(names).toContain('mdi-trophy');
    expect(names).toContain('mdi-handshake');
    expect(icons.every((i) => i.is_active === true)).toBe(true);
  });
});
