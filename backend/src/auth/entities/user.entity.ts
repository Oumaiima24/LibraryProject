import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Roles } from '../generics/role.enum';
import { BookEntity } from '../../books/entities/book.entity';

@Entity('user')
export class UserEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  salt: string;
  
  @Column({
    type: "enum",
    enum: Roles,
    default: Roles.ROLE_USER
  })
  role: Roles;

  @OneToMany(() => BookEntity, (book: BookEntity) => book.user)
  books: BookEntity[];
}