import { MigrationInterface, QueryRunner } from "typeorm";

export class UserFixeCreatedByTypes1672233874475 implements MigrationInterface {
    name = 'UserFixeCreatedByTypes1672233874475'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`createdBy\` \`createdBy\` bigint NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`createdBy\` \`createdBy\` bigint NOT NULL`);
    }

}
