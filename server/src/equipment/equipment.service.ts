import { Injectable } from '@nestjs/common';
import { EventsService } from '../events/events.service.js';
import { EquipmentDto } from './dto.js';
@Injectable() export class EquipmentService {
  constructor(private events: EventsService) {}
  add(eventId: string, adminId: string, dto: EquipmentDto) { return this.events.addEquipment(eventId, adminId, dto); }
  update(eventId: string, equipmentId: string, adminId: string, dto: EquipmentDto) { return this.events.updateEquipment(eventId, equipmentId, adminId, dto); }
  list(eventId: string) { return this.events.config(eventId, 'equipment'); }
  remove(eventId: string, equipmentId: string, adminId: string) { return this.events.remove(eventId, equipmentId, adminId, 'equipment'); }
}
