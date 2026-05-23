import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * ENTITY: Dish
 * Now includes "Audit Metadata" to track who created/modified each dish and when.
 */
@Entity('dishes')
export class Dish {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  /**
   * Stores an array of flavor IDs (e.g., [1, 2]).
   */
  @Column('int', { array: true, nullable: true })
  flavorProfile: number[];

  @Column()
  imageUrl: string;

  /**
   * Technical Metadata: Can still be used for dish-specific info (allergens, calories).
   */
  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  /**
   * Audit Metadata: Automatic timestamps.
   */
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Audit Metadata: Relations to track the User (Chef) responsible.
   */
  @ManyToOne(() => User, { nullable: true })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  updatedBy: User;
}
