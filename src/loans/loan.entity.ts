import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Book } from "../books/book.entity";
import { Borrower } from "../borrowers/borrower.entity";


@Entity()
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  loanDate: Date;

  @Column({ type: 'date', nullable: true })
  returnDate: Date | null;

  @ManyToOne(() => Borrower, (borrower) => borrower.loans)
  borrower: Borrower;

  @ManyToOne(() => Book, (book) => book.loans)
  book: Book;

  @Column({ type: 'varchar', nullable: true })
  notes: string | null;
}