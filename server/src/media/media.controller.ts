import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { AuthUser, Protected } from '../common/auth.js';
import { MediaService } from './media.service.js';

class SignatureQueryDto { @ApiProperty({ enum: ['events', 'food'] }) @IsIn(['events', 'food']) folder: 'events' | 'food'; }
class DeleteUploadDto { @ApiProperty() @IsString() publicId: string; }

@ApiTags('media') @Controller('events/:id/media') export class MediaController {
  constructor(private media: MediaService) {}
  @Post() @Protected(Role.ORGANIZER, Role.ADMIN) @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data') @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } }, required: ['file'] } })
  upload(@Param('id', ParseUUIDPipe) id: string, @UploadedFile() file: Express.Multer.File, @Req() req: { user: AuthUser }) { return this.media.upload(id, req.user.id, file); }
  @Delete() @Protected(Role.ORGANIZER, Role.ADMIN) remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: { user: AuthUser }) { return this.media.remove(id, req.user.id); }
}

@ApiTags('media') @Controller('uploads') export class UploadsController {
  constructor(private media: MediaService) {}
  @Get('signature') @Protected(Role.ORGANIZER, Role.ADMIN) signature(@Query() query: SignatureQueryDto) { return this.media.signature(query.folder); }
  @Delete() @Protected(Role.ORGANIZER, Role.ADMIN) remove(@Body() dto: DeleteUploadDto) { return this.media.deleteUpload(dto.publicId); }
}
