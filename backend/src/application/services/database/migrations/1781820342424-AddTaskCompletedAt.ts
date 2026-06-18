import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaskCompletedAt1781820342424 implements MigrationInterface {
    name = 'AddTaskCompletedAt1781820342424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ADD "completed_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "completed_at"`);
    }

}
