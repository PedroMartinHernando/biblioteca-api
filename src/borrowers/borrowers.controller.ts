import { Controller, Body, Post, Get, Patch, Param } from '@nestjs/common';
import { CreateBorrowerDto } from './dto/create-borrower.dto';
import { BorrowersService } from './borrowers.service';
import { Borrower } from './borrower.entity'

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

    @Patch(':id/deactivate')
    deactivate(@Param('id') id:number): Promise<Borrower> {
        return this.borrowersService.deactivate(Number(id));
    }

    @Patch(':id/reactivate')
    reactivate(@Param('id') id:number): Promise<Borrower> {
        return this.borrowersService.reactivate(Number(id));
    }
}
