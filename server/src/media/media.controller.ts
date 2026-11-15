import { Controller, Delete, Param, ParseUUIDPipe, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthUser, Protected } from '../common/auth.js';
import { MediaService } from './media.service.js';

@ApiTags('media') @Controller('events/:id/media') export class MediaController {
  constructor(private media: MediaService) {}
  @Post() @Protected(Role.ADMIN) @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data') @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } }, required: ['file'] } })
  upload(@Param('id', ParseUUIDPipe) id: string, @UploadedFile() file: Express.Multer.File, @Req() req: { user: AuthUser }) { return this.media.upload(id, req.user.id, file); }
  @Delete() @Protected(Role.ADMIN) remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: { user: AuthUser }) { return this.media.remove(id, req.user.id); }
}
