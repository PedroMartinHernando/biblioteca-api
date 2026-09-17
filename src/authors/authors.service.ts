import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';

@Injectable()
export class AuthorsService {
    constructor( @InjectRepository(Author) private authorsRepository: Repository<Author>) {}

    async create(createAuthorDto: CreateAuthorDto): Promise <Author> {
        const author = this.authorsRepository.create({name: createAuthorDto.name});
        return this.authorsRepository.save(author);
    }

    async findAll(): Promise<Author[]> {
        return this.authorsRepository.find();
    }
}
