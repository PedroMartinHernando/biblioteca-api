import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Loan } from '../loans/loan.entity';
import { OneToMany } from 'typeorm';

@Entity()
export class Borrower {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Loan, (loan) => loan.borrower)
  loans: Loan[];
}