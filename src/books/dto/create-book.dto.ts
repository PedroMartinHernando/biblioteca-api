import { ArrayUnique, IsArray, IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateBookDto {
    @IsNotEmpty()
    @IsString()
    title:string;

    @IsInt()
    authorId: number;

    @IsArray()
    @ArrayUnique()
    genreIds: number[];
}