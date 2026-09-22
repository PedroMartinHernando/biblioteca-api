import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { Book } from '../books/book.entity';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorsService {
    constructor( 
        @InjectRepository(Author) private authorsRepository: Repository<Author>,
        @InjectRepository(Book) private bookRepository: Repository<Book>
    ) {}

    async create(createAuthorDto: CreateAuthorDto): Promise <Author> {
        const author = this.authorsRepository.create({name: createAuthorDto.name});
        return this.authorsRepository.save(author);
    }

    async findAll(): Promise<Author[]> {
        return this.authorsRepository.find();
    }

    async update(id: number, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
        const author = await this.authorsRepository.findOne({where: {id}});
        if(!author){
            throw new NotFoundException(`Author with id ${id} not found`);
        }
        
        await this.authorsRepository.update(id, {name: updateAuthorDto.name})
        
        const updatedAuthor = await this.authorsRepository.findOneBy({id});
        if(!updatedAuthor){
            throw new NotFoundException(`Author with id ${id} not found`);
        }

        return updatedAuthor;
    }

    async remove(id:number): Promise<void> {
        const books = await this.bookRepository.findBy({author: {id}});
    
        if(books.length > 0){
            throw new ConflictException (`Cannot delete author with id ${id}: has ${books.length} book(s) associated`);
        }
        
        const result = await this.authorsRepository.delete(id);
        if(result.affected === 0){
            throw new NotFoundException(`Author with id ${id} not found`);
        }
    }
}
