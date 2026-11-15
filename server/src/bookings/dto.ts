import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
export class BookDto { @ApiProperty({ required: false }) @IsOptional() @IsUUID() parkingZoneId?: string; }
