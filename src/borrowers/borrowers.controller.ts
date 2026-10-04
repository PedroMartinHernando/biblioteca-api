import { Controller, Body, Post, Get } from '@nestjs/common';
import { CreateBorrowerDto } from './dto/create-borrower.dto';
import { BorrowersService } from './borrowers.service';

@Controller('borrowers')
export class BorrowersController {
    constructor(
        private borrowersService: BorrowersService
    ){}

    @Post()
    create(@Body() createBorrowerDto: CreateBorrowerDto){
        return this.borrowersService.create(createBorrowerDto);
    }

    @Get()
    findAll(){
        return this.borrowersService.findAll();
    }
}
