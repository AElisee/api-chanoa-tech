import { Test, TestingModule } from '@nestjs/testing';
import { ProduitCommandeController } from './produit_commande.controller';
import { ProduitCommandeService } from './produit_commande.service';

describe('ProduitCommandeController', () => {
  let controller: ProduitCommandeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProduitCommandeController],
      providers: [ProduitCommandeService],
    }).compile();

    controller = module.get<ProduitCommandeController>(ProduitCommandeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
