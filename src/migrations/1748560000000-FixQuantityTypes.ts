import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixQuantityTypes1748560000000 implements MigrationInterface {
  name = 'FixQuantityTypes1748560000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`carts_items\` MODIFY \`quantity\` int NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`order_items\` MODIFY \`quantity\` int NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`order_items\` MODIFY \`quantity\` decimal(12,2) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`carts_items\` MODIFY \`quantity\` decimal(12,2) NOT NULL`);
  }
}
