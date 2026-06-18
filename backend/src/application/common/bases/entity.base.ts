import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class EntityBase<T> {
  public update(data: Partial<T>): this {
    for (const key of Object.keys(data) as (keyof T)[]) {
      if (data[key] !== undefined) {
        (this as any)[key] = data[key];
      }
    }
    return this;
  }

  public prune(keys: (keyof T)[]): this {
    for (const key of keys) {
      delete (this as any)[key];
    }
    return this;
  }

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  public updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  public deletedAt: Nullable<Date>;
}
