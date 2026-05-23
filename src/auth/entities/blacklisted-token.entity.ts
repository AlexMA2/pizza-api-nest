import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * ENTITY: BlacklistedToken
 * This table stores tokens that have been "killed" by a logout action.
 */
@Entity('blacklisted_tokens')
export class BlacklistedToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  token: string;

  @CreateDateColumn()
  createdAt: Date;
}
