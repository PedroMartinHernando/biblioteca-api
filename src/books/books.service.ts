import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {
    constructor(
        @InjectRepository(Book) private booksRepository: Repository<Book>
    ) {}

    async create(createBookDto: CreateBookDto): Promise<Book> {
        const book = this.booksRepository.create({title: createBookDto.title});
        return this.booksRepository.save(book);
    }

    async findAll(): Promise<Book[]> {
        return this.booksRepository.find();
    }
}
