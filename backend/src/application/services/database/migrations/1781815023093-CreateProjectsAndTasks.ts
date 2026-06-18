import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectsAndTasks1781815023093 implements MigrationInterface {
  name = 'CreateProjectsAndTasks1781815023093';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."tasks_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED')`);
    await queryRunner.query(
      `CREATE TABLE "projects" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "project_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner_id" uuid NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_b3613537a59b41f5811258edf99" PRIMARY KEY ("project_id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_projects_deleted_at" ON "projects" ("deleted_at") WHERE "deleted_at" IS NULL`);
    await queryRunner.query(`CREATE INDEX "idx_projects_owner_id" ON "projects" ("owner_id")`);
    await queryRunner.query(
      `CREATE TABLE "project_members" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "project_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_b3f491d3a3f986106d281d8eb4b" PRIMARY KEY ("project_id", "user_id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_project_members_user_id" ON "project_members" ("user_id")`);
    await queryRunner.query(
      `CREATE TABLE "tasks" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "task_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL, "title" character varying NOT NULL, "description" character varying, "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'PENDING', "assignee_id" uuid, CONSTRAINT "PK_3feca00d238e5cf50185fab8d46" PRIMARY KEY ("task_id"))`,
    );
    await queryRunner.query(`CREATE INDEX "idx_tasks_deleted_at" ON "tasks" ("deleted_at") WHERE "deleted_at" IS NULL`);
    await queryRunner.query(`CREATE INDEX "idx_tasks_status" ON "tasks" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_tasks_assignee_id" ON "tasks" ("assignee_id")`);
    await queryRunner.query(`CREATE INDEX "idx_tasks_project_id" ON "tasks" ("project_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_tasks_project_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_tasks_assignee_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_tasks_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_tasks_deleted_at"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP INDEX "public"."idx_project_members_user_id"`);
    await queryRunner.query(`DROP TABLE "project_members"`);
    await queryRunner.query(`DROP INDEX "public"."idx_projects_owner_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_projects_deleted_at"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
  }
}
