import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsUUID, Max, Min, ValidateNested } from 'class-validator';
export class FoodOrderLineDto {
  @ApiProperty() @IsUUID() foodItemId: string;
  @ApiProperty() @IsInt() @Min(1) @Max(10) quantity: number;
}
export class FoodOrderDto {
  @ApiProperty({ type: [FoodOrderLineDto] }) @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => FoodOrderLineDto) items: FoodOrderLineDto[];
}
