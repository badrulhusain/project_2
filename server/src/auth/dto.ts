import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
export class RegisterDto {
  @ApiProperty() @IsString() @MinLength(2) name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() adminCode?: string;
}
export class RegisterOrganizationDto {
  @ApiProperty() @IsString() @MinLength(2) organizationName: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MinLength(2) name?: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
}
export class LoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() password: string;
}

export class NeonLoginDto {
  @ApiProperty() @IsString() token: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() asOrganizer?: boolean;
}
export class SetOrganizationDto {
  @ApiProperty() @IsString() @MinLength(2) organizationName: string;
}
