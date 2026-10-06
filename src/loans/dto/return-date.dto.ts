import { IsDateString, IsOptional } from "class-validator";

export class ReturnDateDto {

    @IsOptional()
    @IsDateString()
    returnDate: Date | null;

}