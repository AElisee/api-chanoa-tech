import { Test, TestingModule } from '@nestjs/testing';
import { ProduitPanierService } from './produit_panier.service';

describe('ProduitPanierService', () => {
  let service: ProduitPanierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProduitPanierService],
    }).compile();

    service = module.get<ProduitPanierService>(ProduitPanierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
