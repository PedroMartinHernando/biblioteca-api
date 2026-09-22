import { Body, Controller, Delete, Get, Param, Post, Patch, HttpCode } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
export class BooksController {
    constructor(
        private booksService: BooksService
    ) {}

    @Post()
    create(@Body() createBookDto: CreateBookDto){
        return this.booksService.create(createBookDto);
    }

    @Get()
    findAll(){
        return this.booksService.findAll();
    }

    @Patch(':id')
    update(@Param('id') id:number, @Body() updateBookDto: UpdateBookDto ) {
        return this.booksService.update(Number(id), updateBookDto);
    }


    @Delete(':id')
    @HttpCode(204)
    remove(@Param('id') id: number): Promise<void>{
        return this.booksService.remove(Number(id));
    }

}
