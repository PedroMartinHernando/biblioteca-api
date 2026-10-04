import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Borrower } from './borrower.entity';
import { Repository } from 'typeorm';
import { CreateBorrowerDto } from './dto/create-borrower.dto';

@Injectable()
export class BorrowersService {
    constructor(
        @InjectRepository(Borrower)
        private borrowerRepository: Repository<Borrower>,
    ) {}
    
    async create(createBorrowerDto: CreateBorrowerDto): Promise<Borrower> {
        const borrower = this.borrowerRepository.create({name: createBorrowerDto.name});
        return this.borrowerRepository.save(borrower);
    }

    async findAll(): Promise<Borrower[]> {
        return this.borrowerRepository.find();
    }

}
