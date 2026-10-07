import { Type } from "class-transformer";
import { IsIn, IsOptional, IsInt } from "class-validator";

export class FindLoansDto {
    @IsOptional()
    @IsIn(['open', 'closed'])
    status?: string;
  
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    bookId?: number;
  
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    borrowerId?: number;
  }