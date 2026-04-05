import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../../entities/vehicle.entity';
import { Conteneur } from '../../entities/conteneur.entity';
import { Passeport } from '../../entities/passeport.entity';
import { VehiclePayment } from '../../entities/vehicle-payment.entity';
import { VehicleCharge } from '../../entities/vehicle-charge.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CreateVehiclePaymentDto } from './dto/create-vehicle-payment.dto';
import { UpdateVehiclePaymentDto } from './dto/update-vehicle-payment.dto';
import { CreateVehicleChargeDto } from './dto/create-vehicle-charge.dto';
import { UpdateVehicleChargeDto } from './dto/update-vehicle-charge.dto';
import { CaisseBalanceService } from '../caisse/caisse-balance.service';

const MAX_VEHICLES_PER_CONTAINER = 4;

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Conteneur)
    private conteneurRepository: Repository<Conteneur>,
    @InjectRepository(Passeport)
    private passeportRepository: Repository<Passeport>,
    @InjectRepository(VehiclePayment)
    private vehiclePaymentRepository: Repository<VehiclePayment>,
    @InjectRepository(VehicleCharge)
    private vehicleChargeRepository: Repository<VehicleCharge>,
    private caisseBalanceService: CaisseBalanceService,
  ) {}

  async findAll() {
    const vehicles = await this.vehicleRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['supplier', 'conteneur', 'conteneur.dossier', 'client', 'passeport'],
    });

    // Fetch charges for all vehicles in one query
    const charges = await this.vehicleChargeRepository.find();
    const chargesByVehicle = new Map<string, number>();
    for (const charge of charges) {
      const current = chargesByVehicle.get(charge.vehicleId) || 0;
      chargesByVehicle.set(charge.vehicleId, current + Number(charge.amount));
    }

    return vehicles.map((v) => ({
      ...v,
      totalChargesDivers: chargesByVehicle.get(v.id) || 0,
    }));
  }

  async findOne(id: string) {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['supplier', 'conteneur', 'conteneur.dossier', 'client', 'passeport'],
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async create(createVehicleDto: CreateVehicleDto) {
    // Check container capacity
    const conteneur = await this.conteneurRepository.findOne({
      where: { id: createVehicleDto.conteneurId },
      relations: ['vehicles'],
    });

    if (!conteneur) {
      throw new NotFoundException('Conteneur not found');
    }

    const currentCount = conteneur.vehicles?.length || 0;
    if (currentCount >= MAX_VEHICLES_PER_CONTAINER) {
      throw new BadRequestException(
        `Le conteneur ne peut pas contenir plus de ${MAX_VEHICLES_PER_CONTAINER} véhicules`,
      );
    }

    // Get passport cost if linked
    let passeportCost = 0;
    if (createVehicleDto.passeportId) {
      const passeport = await this.passeportRepository.findOne({
        where: { id: createVehicleDto.passeportId },
      });
      if (passeport) {
        passeportCost = Number(passeport.montantDu);
      }
    }

    // Calculate transport cost per vehicle (including the new one)
    const vehicleCount = currentCount + 1;
    const transportCostPerVehicle = Number(conteneur.coutTransport) / vehicleCount;

    // Calculate total cost using the formula:
    // (CarPrice + TransportCost) * TheoreticalRate + LocalFees + PassportCost
    const theoreticalRate = createVehicleDto.theoreticalRate || null;
    const localFees = createVehicleDto.localFees || 0;
    const purchasePrice = createVehicleDto.purchasePrice;

    // Only calculate totalCost if a rate is provided
    const totalCost = theoreticalRate && theoreticalRate > 0
      ? (purchasePrice + transportCostPerVehicle) * theoreticalRate + localFees + passeportCost
      : 0;

    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      transportCost: transportCostPerVehicle,
      passeportCost,
      totalCost,
    });

    const savedVehicle = await this.vehicleRepository.save(vehicle);

    // Recalculate transport cost for all vehicles in this container
    await this.recalculateContainerTransportCosts(createVehicleDto.conteneurId);

    return this.findOne(savedVehicle.id);
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['conteneur'],
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Auto-set status to sold when assigning a client
    if (updateVehicleDto.clientId) {
      updateVehicleDto.status = 'sold' as any;
      if (!updateVehicleDto.soldDate && !vehicle.soldDate) {
        updateVehicleDto.soldDate = new Date().toISOString().split('T')[0];
      }
    }

    // Auto-set arrivalDate when status changes to 'ordered' (En stock)
    if (updateVehicleDto.status === 'ordered' as any && !vehicle.arrivalDate) {
      updateVehicleDto.arrivalDate = new Date().toISOString().split('T')[0];
    }

    // If updating passport, recalculate passport cost
    if (updateVehicleDto.passeportId) {
      const passeport = await this.passeportRepository.findOne({
        where: { id: updateVehicleDto.passeportId },
      });
      if (passeport) {
        updateVehicleDto.passeportCost = Number(passeport.montantDu);
      }
    }

    // Recalculate total cost if relevant fields changed
    const shouldRecalculate =
      updateVehicleDto.purchasePrice !== undefined ||
      updateVehicleDto.theoreticalRate !== undefined ||
      updateVehicleDto.localFees !== undefined ||
      updateVehicleDto.passeportCost !== undefined;

    if (shouldRecalculate) {
      const purchasePrice = updateVehicleDto.purchasePrice ?? Number(vehicle.purchasePrice);
      const theoreticalRate = updateVehicleDto.theoreticalRate ?? (Number(vehicle.theoreticalRate) || 0);
      const localFees = updateVehicleDto.localFees ?? Number(vehicle.localFees);
      const passeportCost = updateVehicleDto.passeportCost ?? Number(vehicle.passeportCost);
      const transportCost = Number(vehicle.transportCost);

      updateVehicleDto.totalCost = theoreticalRate > 0
        ? (purchasePrice + transportCost) * theoreticalRate + localFees + passeportCost
        : 0;
    }

    Object.assign(vehicle, updateVehicleDto);
    await this.vehicleRepository.save(vehicle);
    return this.findOne(id);
  }

  async remove(id: string) {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['conteneur'],
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const conteneurId = vehicle.conteneurId;
    await this.vehicleRepository.remove(vehicle);

    // Recalculate transport cost for remaining vehicles
    await this.recalculateContainerTransportCosts(conteneurId);

    return { message: 'Vehicle deleted successfully' };
  }

  private async recalculateContainerTransportCosts(conteneurId: string) {
    const conteneur = await this.conteneurRepository.findOne({
      where: { id: conteneurId },
      relations: ['vehicles'],
    });

    if (conteneur && conteneur.vehicles.length > 0) {
      const transportCostPerVehicle = Number(conteneur.coutTransport) / conteneur.vehicles.length;

      for (const vehicle of conteneur.vehicles) {
        vehicle.transportCost = transportCostPerVehicle;

        // Recalculate total cost
        const purchasePrice = Number(vehicle.purchasePrice);
        const theoreticalRate = Number(vehicle.theoreticalRate) || 0;
        const localFees = Number(vehicle.localFees);
        const passeportCost = Number(vehicle.passeportCost);

        vehicle.totalCost = theoreticalRate > 0
          ? (purchasePrice + transportCostPerVehicle) * theoreticalRate + localFees + passeportCost
          : 0;

        await this.vehicleRepository.save(vehicle);
      }
    }
  }

  // ============ VEHICLE PAYMENTS ============

  async getVehiclePayments(vehicleId: string) {
    return this.vehiclePaymentRepository.find({
      where: { vehicleId },
      order: { date: 'DESC' },
    });
  }

  async createVehiclePayment(createDto: CreateVehiclePaymentDto) {
    // Verify vehicle exists
    const vehicle = await this.vehicleRepository.findOne({ where: { id: createDto.vehicleId } });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const payment = this.vehiclePaymentRepository.create(createDto);
    const saved = await this.vehiclePaymentRepository.save(payment);

    // Deduct from caisse balance (amountUSD * exchangeRate = DZD)
    const deductAmount = Number(saved.amountUSD) * Number(saved.exchangeRate);
    await this.caisseBalanceService.deduct(deductAmount);

    return saved;
  }

  async updateVehiclePayment(id: string, updateDto: UpdateVehiclePaymentDto) {
    const payment = await this.vehiclePaymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Vehicle payment not found');
    }
    Object.assign(payment, updateDto);
    return this.vehiclePaymentRepository.save(payment);
  }

  async deleteVehiclePayment(id: string) {
    const payment = await this.vehiclePaymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Vehicle payment not found');
    }
    // Refund amount back to caisse balance
    const refundAmount = Number(payment.amountUSD) * Number(payment.exchangeRate);
    await this.caisseBalanceService.add(refundAmount);

    await this.vehiclePaymentRepository.remove(payment);
    return { message: 'Payment deleted successfully' };
  }

  // ============ VEHICLE CHARGES ============

  async getVehicleCharges(vehicleId: string) {
    return this.vehicleChargeRepository.find({
      where: { vehicleId },
      order: { createdAt: 'DESC' },
    });
  }

  async createVehicleCharge(createDto: CreateVehicleChargeDto) {
    // Verify vehicle exists
    const vehicle = await this.vehicleRepository.findOne({ where: { id: createDto.vehicleId } });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const charge = this.vehicleChargeRepository.create(createDto);
    return this.vehicleChargeRepository.save(charge);
  }

  async updateVehicleCharge(id: string, updateDto: UpdateVehicleChargeDto) {
    const charge = await this.vehicleChargeRepository.findOne({ where: { id } });
    if (!charge) {
      throw new NotFoundException('Vehicle charge not found');
    }
    Object.assign(charge, updateDto);
    return this.vehicleChargeRepository.save(charge);
  }

  async deleteVehicleCharge(id: string) {
    const charge = await this.vehicleChargeRepository.findOne({ where: { id } });
    if (!charge) {
      throw new NotFoundException('Vehicle charge not found');
    }
    await this.vehicleChargeRepository.remove(charge);
    return { message: 'Charge deleted successfully' };
  }
}
