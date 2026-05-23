import { PartialType } from '@nestjs/mapped-types';
import { CreateDishDto } from './create-dish.dto';

/**
 * DTO: UpdateDishDto
 * We use 'PartialType' to make all the properties of CreateDishDto optional.
 * This is perfect for updates (PATCH requests) where the user might only change one field.
 */
export class UpdateDishDto extends PartialType(CreateDishDto) {}
