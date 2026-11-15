import { Injectable } from '@nestjs/common';
import { EventsService } from '../events/events.service.js';
import { ParkingZoneDto } from './dto.js';
@Injectable() export class ParkingService {
  constructor(private events: EventsService) {}
  add(eventId: string, adminId: string, dto: ParkingZoneDto) { return this.events.addParking(eventId, adminId, dto); }
  list(eventId: string) { return this.events.config(eventId, 'parkingZone'); }
  remove(eventId: string, zoneId: string, adminId: string) { return this.events.remove(eventId, zoneId, adminId, 'parkingZone'); }
}
