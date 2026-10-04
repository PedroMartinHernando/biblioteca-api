import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Author } from "../authors/author.entity";
import { Genre } from "../genres/genre.entity";
import { Loan } from "../loans/loan.entity";

@Entity()
export class Book {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;
    
    @ManyToOne(() => Author, (author) => author.books)
    author: Author;

    @ManyToMany(() => Genre, (genre) => genre.books,  { onDelete: 'CASCADE' })
    @JoinTable()
    genres: Genre[];

    @OneToMany(() => Loan, (loan) => loan.book)
    loans: Loan[];
}