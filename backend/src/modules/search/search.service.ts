import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Dossier } from '../../entities/dossier.entity';
import { Client } from '../../entities/client.entity';
import { Vehicle } from '../../entities/vehicle.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Dossier)
    private dossierRepository: Repository<Dossier>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async globalSearch(query: string) {
    const searchPattern = `%${query}%`;

    const [dossiers, clients, vehicles] = await Promise.all([
      // Search dossiers by reference
      this.dossierRepository.find({
        where: { reference: ILike(searchPattern) },
        relations: ['supplier'],
        take: 10,
      }),

      // Search clients by name
      this.clientRepository.find({
        where: [
          { nom: ILike(searchPattern) },
          { prenom: ILike(searchPattern) },
        ],
        take: 10,
      }),

      // Search vehicles by VIN
      this.vehicleRepository.find({
        where: { vin: ILike(searchPattern) },
        relations: ['conteneur', 'conteneur.dossier'],
        take: 10,
      }),
    ]);

    return {
      dossiers: dossiers.map((d) => ({
        id: d.id,
        type: 'dossier',
        reference: d.reference,
        supplier: d.supplier?.name,
        status: d.status,
      })),
      clients: clients.map((c) => ({
        id: c.id,
        type: 'client',
        name: `${c.prenom} ${c.nom}`,
        telephone: c.telephone,
      })),
      vehicles: vehicles.map((v) => ({
        id: v.id,
        type: 'vehicle',
        vin: v.vin,
        brand: v.brand,
        model: v.model,
        dossierRef: v.conteneur?.dossier?.reference,
      })),
    };
  }
}
