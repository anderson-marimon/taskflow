import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeProjectsTasksSchema1781817633881 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE INDEX "idx_project_members_project_id" ON "project_members" ("project_id")');
    await queryRunner.query('ALTER TYPE "tasks_status_enum" RENAME TO "task_status"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TYPE "task_status" RENAME TO "tasks_status_enum"');
    await queryRunner.query('DROP INDEX "idx_project_members_project_id"');
  }
}
