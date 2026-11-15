import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module.js';
import { MediaController, UploadsController } from './media.controller.js';
import { MediaService } from './media.service.js';
@Module({ imports: [EventsModule], controllers: [MediaController, UploadsController], providers: [MediaService] }) export class MediaModule {}
