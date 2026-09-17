import { Module } from '@nestjs/common';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from './author.entity';

@Module({
  controllers: [AuthorsController],
  providers: [AuthorsService],
  imports: [TypeOrmModule.forFeature([Author])]
})

export class AuthorsModule {}
