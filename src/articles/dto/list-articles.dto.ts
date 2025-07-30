import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PAGINATION_CONSTANTS } from '../../common/constants/pagination.constants';

export class ListArticlesDto {
  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  favorited?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = PAGINATION_CONSTANTS.DEFAULT_LIMIT;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number = PAGINATION_CONSTANTS.DEFAULT_OFFSET;
}
