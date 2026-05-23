import { IsArray, IsEnum, IsNumber } from "class-validator";
import { DishFlavors } from "./flavors.dto";

/**
 * DTO: CreateDishDto
 * DTO stands for Data Transfer Object. It defines the schema of the data
 * we expect when a client (like a frontend) wants to CREATE a new dish.
 * Unlike the Entity, it doesn't include the 'id' because the database generates that.
 */
export class CreateDishDto {
  /**
   * The name of the dish is required.
   */
  readonly name: string;

  /**
   * The price of the dish.
   */
  readonly price: number;

  /**
   * The flavor profile as an array of flavor IDs (e.g., 1 = Spicy, 2 = Acid).
   */
  @IsArray()
  @IsEnum(DishFlavors, { each: true })
  readonly flavorProfile: DishFlavors[];

  /**
   * The image URL will usually be provided after uploading to S3.
   */
  readonly imageUrl: string;

  /**
   * Optional metadata.
   */
  readonly metadata?: Record<string, any>;
}
