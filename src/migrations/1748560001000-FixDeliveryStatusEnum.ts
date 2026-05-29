import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixDeliveryStatusEnum1748560001000 implements MigrationInterface {
  name = 'FixDeliveryStatusEnum1748560001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`deliveries\` MODIFY \`status\` enum('pending','picked_up','in_transit','out_for_delivery','delivered','failed','returned') NOT NULL DEFAULT 'pending'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`deliveries\` MODIFY \`status\` varchar(255) NOT NULL DEFAULT 'pending'`,
    );
  }
}
