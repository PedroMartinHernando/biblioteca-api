import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Author } from "../authors/author.entity";
import { Genre } from "../genres/genre.entity";

@Entity()
export class Book {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;
    
    @ManyToOne(() => Author, (author) => author.books)
    author: Author;

    @ManyToMany(() => Genre, (genre) => genre.books)
    @JoinTable()
    genres: Genre[];
    
}