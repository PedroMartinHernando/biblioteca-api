import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { Repository, In } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { Author } from '../authors/author.entity';
import { Genre } from '../genres/genre.entity';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
    constructor(
        @InjectRepository(Book) private booksRepository: Repository<Book>,
        @InjectRepository(Author) private authorRepository: Repository<Author>,
        @InjectRepository(Genre) private genreRepository: Repository<Genre>
    ) {}

    async create(createBookDto: CreateBookDto): Promise<Book> {
        const author = await this.authorRepository.findOneBy({id: createBookDto.authorId})
        if (!author) {
            throw new NotFoundException(`Author with id ${createBookDto.authorId} not found`);
        }
        const genres = await this.genreRepository.findBy({id: In(createBookDto.genreIds)})
        const book = this.booksRepository.create({title: createBookDto.title, author: author, genres: genres});
        return this.booksRepository.save(book);
    }

    async findAll(): Promise<Book[]> {
        return this.booksRepository.find({
            relations: ['author', 'genres']
        });
    }

    async update(id: number, updateBookDto: UpdateBookDto): Promise<Book>{
        const book = await this.booksRepository.findOne({
            where:{id}, 
            relations: ['author', 'genres']
        });

        if(!book){
            throw new NotFoundException(`Book with id ${id} not found`);
        }

        if(updateBookDto.title !== undefined) {
            book.title = updateBookDto.title;
        }

        if(updateBookDto.authorId !== undefined) {
            const author = await this.authorRepository.findOneBy({id: updateBookDto.authorId});
            if (!author) {
                throw new NotFoundException(`Author with id ${updateBookDto.authorId} not found`);
            }
            book.author = author;
        }

        if(updateBookDto.genreIds !== undefined) {
            const genres = await this.genreRepository.findBy({ id: In(updateBookDto.genreIds)});
            if(genres.length !== updateBookDto.genreIds.length) {
                throw new NotFoundException('One or more genres not found');
            }
            book.genres = genres;
        }

        return this.booksRepository.save(book);
    }

    async remove(id:number): Promise<void> {
        const result = await this.booksRepository.delete(id);
        if(result.affected === 0){
            throw new NotFoundException(`Book with id ${id} not found`);
        }
    }
}
