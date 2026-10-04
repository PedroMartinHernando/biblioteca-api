import { IsNotEmpty, IsString } from "class-validator";

export class CreateBorrowerDto {
    @IsNotEmpty()
    @IsString()
    name: string;
}