import { Controller, Post, Get, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from '../authors/dto/update-author.dto';

@Controller('authors')
export class AuthorsController {
    constructor( 
        private authorsService: AuthorsService
    ) {}

    @Post()
    create(@Body() createAuthorDto: CreateAuthorDto){
        return this.authorsService.create(createAuthorDto);
    }

    @Get()
    findAll(){
        return this.authorsService.findAll();
    }

    @Patch(':id')
    update(@Param('id') id:number, @Body() updateAuthorDto: UpdateAuthorDto){
        return this.authorsService.update(Number(id), updateAuthorDto);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(@Param('id') id:number): Promise<void> {
        return this.authorsService.remove(Number(id));
    }
}
