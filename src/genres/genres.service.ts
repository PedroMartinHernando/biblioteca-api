import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGenreDto } from './dto/create-genre.dto';
import { Repository } from 'typeorm';
import { Genre } from './genre.entity';

@Injectable()
export class GenresService {

    constructor(
        @InjectRepository(Genre) private genreRepository: Repository<Genre>
    ){}

    async create(createGenreDto: CreateGenreDto): Promise <Genre> {
        const genre = this.genreRepository.create({name: createGenreDto.name})
        return this.genreRepository.save(genre);
    }

    async findAll(): Promise <Genre[]> {
        return this.genreRepository.find();
    }
}
