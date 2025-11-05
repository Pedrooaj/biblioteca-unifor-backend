import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ description: 'ID do exemplar (bookCopyId)' })
  @IsString()
  @IsNotEmpty()
  bookCopyId: string;
}
