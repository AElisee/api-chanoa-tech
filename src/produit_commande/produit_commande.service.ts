import { Injectable } from '@nestjs/common';
import { CreateProduitCommandeDto } from './dto/create-produit_commande.dto';
import { UpdateProduitCommandeDto } from './dto/update-produit_commande.dto';

@Injectable()
export class ProduitCommandeService {
  create(createProduitCommandeDto: CreateProduitCommandeDto) {
    return 'This action adds a new produitCommande';
  }

  findAll() {
    return `This action returns all produitCommande`;
  }

  findOne(id: number) {
    return `This action returns a #${id} produitCommande`;
  }

  update(id: number, updateProduitCommandeDto: UpdateProduitCommandeDto) {
    return `This action updates a #${id} produitCommande`;
  }

  remove(id: number) {
    return `This action removes a #${id} produitCommande`;
  }
}
