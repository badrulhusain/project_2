import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
export class ScanDto { @ApiProperty() @IsUUID() qrToken: string; }
export class CollectLineDto { @ApiProperty() @IsUUID() foodItemId: string; @ApiProperty() @IsInt() @Min(1) quantity: number; }
export class CollectDto extends ScanDto { @ApiProperty({ type: [CollectLineDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => CollectLineDto) items: CollectLineDto[]; }
