import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Book } from "../books/book.entity";
@Entity()
export class Author {

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    name: string;

    @OneToMany(() => Book, (book) => book.author)
    books: Book[];
    
}
