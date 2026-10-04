import { Module } from '@nestjs/common';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { Loan } from './loan.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../books/book.entity';
import { Borrower } from '../borrowers/borrower.entity';

@Module({
  controllers: [LoansController],
  providers: [LoansService],
  imports: [TypeOrmModule.forFeature([Loan, Book, Borrower])]
})
export class LoansModule {}
