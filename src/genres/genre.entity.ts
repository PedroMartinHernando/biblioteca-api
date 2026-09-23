import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { Book } from "../books/book.entity";

@Entity()
export class Genre {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name:string;

    @ManyToMany(() => Book, (book) => book.genres, { onDelete: 'CASCADE' })
    books: Book[];

}