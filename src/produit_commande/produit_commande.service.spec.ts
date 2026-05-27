import { Test, TestingModule } from '@nestjs/testing';
import { ProduitCommandeService } from './produit_commande.service';

describe('ProduitCommandeService', () => {
  let service: ProduitCommandeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProduitCommandeService],
    }).compile();

    service = module.get<ProduitCommandeService>(ProduitCommandeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
