import { DataSource, EntityTarget, FindOptionsWhere, Repository } from 'typeorm';

export abstract class BaseRepository<T extends { id: string }> {
  protected repo: Repository<T>;

  constructor(entity: EntityTarget<T>, dataSource: DataSource) {
    this.repo = dataSource.getRepository(entity);
  }

  async findById(id: string): Promise<T | null> {
    return this.repo.findOne({ where: { id } as FindOptionsWhere<T> });
  }

  async save(entity: Partial<T>): Promise<T> {
    return this.repo.save(entity as T);
  }

  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repo.count({ where });
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
