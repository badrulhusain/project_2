import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
export class BookDto {
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() parkingZoneId?: string;
  @ApiProperty({ required: false, minimum: 1, maximum: 10, default: 1 }) @IsOptional() @IsInt() @Min(1) @Max(10) seats?: number;
}
