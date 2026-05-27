import { Injectable } from '@nestjs/common';
import { CreateProduitPanierDto } from './dto/create-produit_panier.dto';
import { UpdateProduitPanierDto } from './dto/update-produit_panier.dto';

@Injectable()
export class ProduitPanierService {
  create(createProduitPanierDto: CreateProduitPanierDto) {
    return 'This action adds a new produitPanier';
  }

  findAll() {
    return `This action returns all produitPanier`;
  }

  findOne(id: number) {
    return `This action returns a #${id} produitPanier`;
  }

  update(id: number, updateProduitPanierDto: UpdateProduitPanierDto) {
    return `This action updates a #${id} produitPanier`;
  }

  remove(id: number) {
    return `This action removes a #${id} produitPanier`;
  }
}
