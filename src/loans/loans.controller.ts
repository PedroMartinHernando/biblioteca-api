import { Body, Controller, Get, Patch, Post, Param, Query} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ReturnDateDto } from './dto/return-date.dto';
import { FindLoansDto } from './dto/find-loans.dto';

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
    findAll(@Query() query: FindLoansDto){
        return this.loansService.findAll(query);
    }

    @Patch('/:id/return')
    returnBook(@Param('id') id: number, @Body()returnDateDto: ReturnDateDto ){
        return this.loansService.returnBook(Number(id), returnDateDto)
    }
    
}
