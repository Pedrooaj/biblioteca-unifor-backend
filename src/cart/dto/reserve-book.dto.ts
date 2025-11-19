import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class ReserveBookDto {
  @ApiProperty({
    description: 'Data limite da reserva (formato ISO 8601)',
    example: '2025-12-05T23:59:59Z',
  })
  @IsNotEmpty()
  @IsDateString()
  dataLimite: string;
}
