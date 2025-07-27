import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: number; // Auto-incremented primary key

  @Column({ unique: true })
  email: string; // User's email (must be unique)

  @Column()
  password: string; // Hashed password (never store plain text)

  @CreateDateColumn()
  created_at: Date; // Auto-set when the user is created

  @UpdateDateColumn()
  updated_at: Date; // Auto-updated whenever user is updated

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date; // Soft-delete timestamp (null if not deleted)
}
