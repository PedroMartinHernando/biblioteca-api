import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { Repository, In } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { Author } from '../authors/author.entity';
import { Genre } from '../genres/genre.entity';

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
        return this.booksRepository.find();
    }
}
