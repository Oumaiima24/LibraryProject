import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { TimeStampISIDS } from "../shared/timestamp";
import { AuthorEntity } from "./author.entity";
import { UserEntity } from "src/auth/entities/user.entity";

@Entity('livre')
export class BookEntity extends TimeStampISIDS {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    title: string;

    @Column()
    year: number;

    @Column({ type: "varchar" })
    editor: string;

    @Column()
    image: string;

    @ManyToOne(() => AuthorEntity, author => author.listeLivres)
    @JoinColumn({ name: 'author_id' }) // clé étrangère vers AuthorEntity
    author: AuthorEntity;

    @ManyToOne(() => UserEntity, user => user.books)
    @JoinColumn({ name: 'user_id' }) // clé étrangère vers UserEntity
    user: UserEntity;
}