import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { Readable } from 'node:stream';
import { randomUUID } from 'node:crypto';
import { EventsService } from '../events/events.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable() export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  constructor(private config: ConfigService, private events: EventsService, private prisma: PrismaService) {}
  private configure() {
    const cloud_name = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const api_key = this.config.get<string>('CLOUDINARY_API_KEY');
    const api_secret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (!cloud_name || !api_key || !api_secret) throw new ServiceUnavailableException('Media storage is not configured');
    cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  }
  signature(folder: 'events' | 'food') {
    this.configure();
    const cloudName = this.config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.getOrThrow<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.getOrThrow<string>('CLOUDINARY_API_SECRET');
    const timestamp = Math.floor(Date.now() / 1000);
    const path = `eventsense/${folder}`;
    const publicId = randomUUID();
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder: path, public_id: publicId }, apiSecret);
    return { cloudName, apiKey, timestamp, folder: path, publicId, signature };
  }
  async deleteUpload(publicId: string) {
    this.configure();
    if (!/^eventsense\/(events|food)\/[A-Za-z0-9_-]+$/.test(publicId)) throw new BadRequestException('Invalid media identifier');
    if (await this.prisma.event.findFirst({ where: { imagePublicId: publicId } })) throw new BadRequestException('Attached event media must be removed through the event');
    return cloudinary.uploader.destroy(publicId);
  }
  private validate(file?: Express.Multer.File) {
    if (!file?.buffer?.length) throw new BadRequestException('Image file is required');
    const bytes = file.buffer;
    const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const webp = bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
    if (!jpeg && !png && !webp) throw new BadRequestException('Only JPEG, PNG, or WebP images are allowed');
  }
  async upload(eventId: string, adminId: string, file?: Express.Multer.File) {
    const event = await this.events.own(eventId, adminId);
    this.validate(file);
    this.configure();
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'eventsense/events', public_id: randomUUID(), resource_type: 'image' }, (error, uploaded) => {
        if (error || !uploaded) reject(error ?? new Error('Upload failed')); else resolve(uploaded);
      });
      Readable.from(file!.buffer).pipe(stream);
    });
    try {
      const updated = await this.prisma.event.update({ where: { id: eventId }, data: { imageUrl: result.secure_url, imagePublicId: result.public_id } });
      if (event.imagePublicId) await cloudinary.uploader.destroy(event.imagePublicId).catch(error => this.logger.warn(`Could not remove previous Cloudinary asset: ${String(error)}`));
      return { imageUrl: updated.imageUrl, imagePublicId: updated.imagePublicId };
    } catch (error) {
      await cloudinary.uploader.destroy(result.public_id).catch(cleanupError => this.logger.warn(`Could not clean up uploaded Cloudinary asset: ${String(cleanupError)}`));
      throw error;
    }
  }
  async remove(eventId: string, adminId: string) {
    const event = await this.events.own(eventId, adminId);
    this.configure();
    if (event.imagePublicId) await cloudinary.uploader.destroy(event.imagePublicId);
    await this.prisma.event.update({ where: { id: eventId }, data: { imageUrl: null, imagePublicId: null } });
    return { imageUrl: null };
  }
}
