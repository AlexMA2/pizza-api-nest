import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Dish } from './entities/dish.entity';

/**
 * SERVICE: DishesService
 * Now using TypeORM Repository to interact with AWS RDS.
 */
@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish)
    private dishesRepository: Repository<Dish>,
  ) { }

  /**
   * Logic to create a new dish in the database.
   * Now saves the user who created it.
   */
  async create(createDishDto: CreateDishDto, user: any): Promise<Dish> {
    const newDish = this.dishesRepository.create({
      ...createDishDto,
      createdBy: { id: user.userId }, // Associate with the Chef
      updatedBy: { id: user.userId },
    });
    return this.dishesRepository.save(newDish);
  }

  /**
   * Logic to get all dishes from the database.
   */
  async findAll(): Promise<Dish[]> {
    return this.dishesRepository.find({
      relations: ['createdBy', 'updatedBy'], // Optionally load who created it
    });
  }

  /**
   * Logic to find one dish by its ID.
   */
  async findOne(id: number): Promise<Dish> {
    const dish = await this.dishesRepository.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy'],
    });
    if (!dish) {
      throw new NotFoundException(`Dish with ID ${id} not found`);
    }
    return dish;
  }

  /**
   * Logic to update an existing dish in the database.
   * Now tracks who made the modification.
   */
  async update(
    id: number,
    updateDishDto: UpdateDishDto,
    user: any,
  ): Promise<Dish> {
    const dish = await this.findOne(id);
    const updatedDish = this.dishesRepository.merge(dish, {
      ...updateDishDto,
      updatedBy: { id: user.userId },
    });
    return this.dishesRepository.save(updatedDish);
  }

  /**
   * Logic to delete a dish from the database.
   */
  /**
   * Logic to delete a dish from the database.
   */
  async remove(id: number): Promise<void> {
    const dish = await this.findOne(id);
    await this.dishesRepository.remove(dish);
  }

  /**
   * Special update for the Lambda function webhook.
   */
  async updateImageUrl(id: number, imageUrl: string): Promise<Dish> {
    const dish = await this.findOne(id);
    dish.imageUrl = imageUrl;
    return this.dishesRepository.save(dish);
  }
}
