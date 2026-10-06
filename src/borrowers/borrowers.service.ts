import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
        return this.borrowerRepository.findBy({ active:true });
    }

    async deactivate(id:number): Promise<Borrower> {
        const borrower = await this.searchBorrower(id);
        if(!borrower.active){
            throw new ConflictException(`Borrower with id ${id} is already deactivated`)
        }
        borrower.active = false;
        return this.borrowerRepository.save(borrower)
    }

    async reactivate(id:number): Promise<Borrower> {
        const borrower = await this.searchBorrower(id);
        if(borrower.active){
            throw new ConflictException(`Borrower with id ${id} is already active`)
        }
        borrower.active = true;
        return this.borrowerRepository.save(borrower)
    }

    
    private async searchBorrower(id:number): Promise<Borrower> {
        const borrower = await this.borrowerRepository.findOneBy({ id:id })
        if(!borrower){
            throw new NotFoundException(`Borrower with id ${id} not found`);
        }
        return borrower;
    }
}
