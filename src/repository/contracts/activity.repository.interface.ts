import { Prisma } from '@prisma/client';

export interface ActivityRepositoryInterface {
  create(data: {
    icon_id: bigint;
    title: string;
    subtitle: string;
    is_published: boolean;
    sort_order: number | null;
  }): Promise<Prisma.ActivityGetPayload<{}>>;

  findById(id: bigint): Promise<Prisma.ActivityGetPayload<{}> | null>;

  findByIdWithIcon(id: bigint): Promise<
    Prisma.ActivityGetPayload<{
      include: {
        icon: {
          select: {
            id: true;
            name: true;
            label: true;
            is_active: true;
          };
        };
      };
    }> | null
  >;

  updateById(
    id: bigint,
    data: Partial<{
      icon_id: bigint;
      title: string;
      subtitle: string;
      is_published: boolean;
      sort_order: number | null;
    }>
  ): Promise<Prisma.ActivityGetPayload<{}>>;

  deleteById(id: bigint): Promise<Prisma.ActivityGetPayload<{}>>;

  findManyWithIconOrdered(): Promise<
    Prisma.ActivityGetPayload<{
      include: {
        icon: {
          select: {
            id: true;
            name: true;
            label: true;
            is_active: true;
          };
        };
      };
    }>[]
  >;

  findManyPublishedWithIconOrdered(): Promise<
    Prisma.ActivityGetPayload<{
      include: {
        icon: {
          select: {
            id: true;
            name: true;
            label: true;
            is_active: true;
          };
        };
      };
    }>[]
  >;

  getMaxSortOrder(): Promise<number | null>;

  countByIds(ids: bigint[]): Promise<number>;

  updateSortOrders(ids: bigint[]): Promise<Prisma.ActivityGetPayload<{}>[]>;
}
