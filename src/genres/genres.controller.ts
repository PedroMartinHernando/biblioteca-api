import { Body, Controller, Get, Post } from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';

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
}
