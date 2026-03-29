import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarModel } from '../../entities/car-model.entity';
import { CreateCarModelDto } from './dto/create-car-model.dto';
import { UpdateCarModelDto } from './dto/update-car-model.dto';

@Injectable()
export class CarModelsService {
  constructor(
    @InjectRepository(CarModel)
    private carModelRepository: Repository<CarModel>,
  ) {}

  async findAll(): Promise<CarModel[]> {
    return this.carModelRepository.find({ order: { brand: 'ASC', model: 'ASC' } });
  }

  async findOne(id: string): Promise<CarModel> {
    const carModel = await this.carModelRepository.findOne({ where: { id } });
    if (!carModel) throw new NotFoundException(`Car model #${id} not found`);
    return carModel;
  }

  async findByBrand(brand: string): Promise<CarModel[]> {
    return this.carModelRepository.find({
      where: { brand },
      order: { model: 'ASC' },
    });
  }

  async create(dto: CreateCarModelDto): Promise<CarModel> {
    const carModel = this.carModelRepository.create(dto);
    return this.carModelRepository.save(carModel);
  }

  async update(id: string, dto: UpdateCarModelDto): Promise<CarModel> {
    await this.findOne(id);
    await this.carModelRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.carModelRepository.delete(id);
  }
}
