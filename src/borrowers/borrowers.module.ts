import { Module } from '@nestjs/common';
import { BorrowersController } from './borrowers.controller';
import { BorrowersService } from './borrowers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borrower } from './borrower.entity';
import { Loan } from '../loans/loan.entity';

@Module({
  controllers: [BorrowersController],
  providers: [BorrowersService],
  imports: [TypeOrmModule.forFeature([Borrower, Loan])]
})
export class BorrowersModule {}
