import { ApiProperty, PartialType } from '@nestjs/swagger';
import { EventType, FoodTag, VehicleType } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
export class CreateEventDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsString() venue: string;
  @ApiProperty() @IsDateString() startAt: string;
  @ApiProperty() @IsDateString() endAt: string;
  @ApiProperty({ enum: EventType }) @IsEnum(EventType) type: EventType;
  @ApiProperty() @IsBoolean() isPaid: boolean;
  @ApiProperty() @IsInt() @IsPositive() capacity: number;
  @ApiProperty() @IsInt() @IsPositive() safetyLimit: number;
  @ApiProperty() @IsNumber() @IsPositive() powerLimitKw: number;
  @ApiProperty() @IsDateString() bookingCutoffAt: string;
  @ApiProperty() @IsDateString() foodCutoffAt: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() seatReleaseAt?: string;
}
export class UpdateEventDto extends PartialType(CreateEventDto) {}
export class FoodItemDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ enum: FoodTag }) @IsEnum(FoodTag) tag: FoodTag;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) unitCost?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @IsPositive() maxQuantity?: number;
}
export class ParkingZoneDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ enum: VehicleType }) @IsEnum(VehicleType) vehicleType: VehicleType;
  @ApiProperty() @IsInt() @IsPositive() capacity: number;
}
export class EquipmentDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsInt() @IsPositive() watts: number;
  @ApiProperty() @IsInt() @IsPositive() count: number;
  @ApiProperty() @IsDateString() startAt: string;
  @ApiProperty() @IsDateString() endAt: string;
  @ApiProperty() @IsBoolean() occupancyScaled: boolean;
}
