import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({
    description: 'Data limite para devolução do(s) livro(s) (formato ISO 8601)',
    example: '2025-12-05T23:59:59Z',
  })
  @IsNotEmpty()
  @IsDateString()
  dataLimite: string;
}
