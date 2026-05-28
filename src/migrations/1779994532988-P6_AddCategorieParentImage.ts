import { MigrationInterface, QueryRunner } from "typeorm";

// Cette migration est un marqueur vide : les changements ont déjà été appliqués
// par la migration P6_CreateProduitVariant exécutée précédemment avec synchronize:true.
export class P6AddCategorieParentImage1779994532988 implements MigrationInterface {
    name = 'P6AddCategorieParentImage1779994532988'

    public async up(_queryRunner: QueryRunner): Promise<void> {
        // no-op : categories.image_url et categories.parent_id déjà présents
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // no-op
    }
}
