import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * ENUM for Roles
 */
export enum UserRole {
  CHEF = 'chef',
  CUSTOMER = 'customer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  /**
   * Role-Based Access Control (RBAC)
   * The role determines what the user can do.
   */
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;
}
