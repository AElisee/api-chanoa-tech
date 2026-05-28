import { MigrationInterface, QueryRunner } from "typeorm";

// Cette migration est un marqueur vide : la table admin_activity_logs a déjà été créée
// par la migration P6_CreateProduitVariant exécutée précédemment.
export class P6CreateAdminActivityLog1779994540080 implements MigrationInterface {
    name = 'P6CreateAdminActivityLog1779994540080'

    public async up(_queryRunner: QueryRunner): Promise<void> {
        // no-op : admin_activity_logs déjà présente
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // no-op
    }
}
