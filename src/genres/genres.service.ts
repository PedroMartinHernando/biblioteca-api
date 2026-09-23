import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGenreDto } from './dto/create-genre.dto';
import { Repository } from 'typeorm';
import { Genre } from './genre.entity';
import { UpdateGenreDto } from '../genres/dto/update-genre.dto';
import { throwError } from 'rxjs';

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

    async update(id: number, updateGenreDto: UpdateGenreDto){
        const genre = await this.genreRepository.findOneBy({id});
        if(!genre){
            throw new NotFoundException(`Genre with id ${id} not found`);
        }

        await this.genreRepository.update(id, {name: updateGenreDto.name});

        const updatedGenre = await this.genreRepository.findOneBy({id});
        if(!updateGenreDto){
            throw new NotFoundException(`Genre with id ${id} not found`);
        }

        return updatedGenre;
    }

    async remove(id: number): Promise<void> {
        const result = await this.genreRepository.delete(id);
        if(result.affected === 0){
            throw new NotFoundException(`Genre with id ${id} not found`)
        }
    }
}
