import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Loan } from './loan.entity';
import { Repository, IsNull } from 'typeorm';
import { CreateLoanDto } from './dto/create-loan.dto';
import { Book } from '../books/book.entity';
import { Borrower } from '../borrowers/borrower.entity';

@Injectable()
export class LoansService {
    constructor(
        @InjectRepository(Loan) private loansRepository: Repository<Loan>,
        @InjectRepository(Book) private bookRepository: Repository<Book>,
        @InjectRepository(Borrower) private borrowerRepository: Repository<Borrower>
    ) {}

    async create(createLoanDto: CreateLoanDto): Promise<Loan> {
        const book = await this.bookRepository.findOneBy({id: createLoanDto.bookId});
        if (!book) {
            throw new NotFoundException(`Book with id ${createLoanDto.bookId} not found`);
        }
        
        const activeLoan = await this.loansRepository.findOne({
            where: {
                book: { id: createLoanDto.bookId },
                returnDate: IsNull(),
            },
            relations: ['borrower'],
        });
        if(activeLoan){
            throw new ConflictException(`Book with id ${createLoanDto.bookId} is already loaned to ${activeLoan.borrower.name}`)
        }

        const borrower = await this.borrowerRepository.findOneBy({id: createLoanDto.borrowerId});
        if (!borrower) {
            throw new NotFoundException(`Borrower with id ${createLoanDto.borrowerId} not found`);
        }

        const loan = this.loansRepository.create({
            book, 
            borrower, 
            loanDate: createLoanDto.loanDate, 
            notes: createLoanDto.notes
        });

        return this.loansRepository.save(loan);
    }

    async findAll(): Promise<Loan[]> {
        return this.loansRepository.find({
            relations: ['book', 'borrower']
        })
    }
}
