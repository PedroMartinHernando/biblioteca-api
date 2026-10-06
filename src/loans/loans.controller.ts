import { Body, Controller, Get, Patch, Post, Param} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ReturnDateDto } from './dto/return-date.dto';

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

    @Patch('/:id/return')
    returnBook(@Param('id') id: number, @Body()returnDateDto: ReturnDateDto ){
        return this.loansService.returnBook(Number(id), returnDateDto)
    }
}
