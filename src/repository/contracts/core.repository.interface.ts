export interface CoreRepositoryInterface {
  findById(id: number): Promise<any>;
  update(id: number, data: any): Promise<any>;
}
