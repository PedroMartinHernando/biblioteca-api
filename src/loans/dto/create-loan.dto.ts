import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateLoanDto {
    @IsNotEmpty()
    @IsInt()
    bookId: number;

    @IsNotEmpty()
    @IsInt()
    borrowerId: number;

    @IsNotEmpty()
    @IsDateString()
    loanDate: Date;

    @IsOptional()
    @IsString()
    notes: string | null;

}