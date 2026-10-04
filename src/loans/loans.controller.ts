import { Body, Controller, Get, Post } from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';

@Controller('loans')
export class LoansController {
    constructor(
        private loansService: LoansService
     ) {}

    @Post()
    create(@Body() createLoanDto: CreateLoanDto){
        return this.loansService.create(createLoanDto);
    }

    @Get()
    findAll(){
        return this.loansService.findAll();
    }

}
