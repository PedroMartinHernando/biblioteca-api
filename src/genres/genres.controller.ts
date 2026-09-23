import { Body, Controller, Get, Post, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Controller('genres')
export class GenresController {
    constructor(
        private genresService: GenresService
    ){}

    @Post()
    create(@Body() createGenreDto: CreateGenreDto){
        return this.genresService.create(createGenreDto);
    }

    @Get()
    findAll(){
        return this.genresService.findAll();
    }

    @Patch(':id')
    update(@Param('id') id:number, updateGenreDto: UpdateGenreDto){
        return this.genresService.update(id, updateGenreDto);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(@Param('id') id:number): Promise<void> {
        return this.genresService.remove(id);
    }
}
