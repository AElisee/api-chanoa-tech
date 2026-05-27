import { Test, TestingModule } from '@nestjs/testing';
import { ProduitPanierController } from './produit_panier.controller';
import { ProduitPanierService } from './produit_panier.service';

describe('ProduitPanierController', () => {
  let controller: ProduitPanierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProduitPanierController],
      providers: [ProduitPanierService],
    }).compile();

    controller = module.get<ProduitPanierController>(ProduitPanierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
