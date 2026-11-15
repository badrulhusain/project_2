import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PrismaService } from '../src/prisma/prisma.service.js';

const dbUrl = process.env.TEST_DATABASE_URL;
describe.skipIf(!dbUrl)('EventSense API with PostgreSQL', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let userTokens: string[];
  let eventId: string;
  const stamp = Date.now();
  const baseEvent = { title: 'Concurrency test', description: 'Five seats', venue: 'Test hall',
    startAt: '2030-01-10T10:00:00.000Z', endAt: '2030-01-10T12:00:00.000Z', type: 'SEMINAR', isPaid: false,
    capacity: 5, safetyLimit: 5, powerLimitKw: 10, bookingCutoffAt: '2030-01-09T10:00:00.000Z', foodCutoffAt: '2030-01-09T10:00:00.000Z' };
  beforeAll(async () => {
    process.env.DATABASE_URL = dbUrl;
    process.env.JWT_SECRET = 'test-secret-at-least-sixteen-characters';
    process.env.ADMIN_SIGNUP_CODE = 'test-admin-code';
    process.env.CLIENT_URL = 'http://localhost:3001';
    const { AppModule } = await import('../src/app.module.js');
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    const admin = await request(app.getHttpServer()).post('/api/auth/register').send({ name: 'Test Admin', email: `admin-${stamp}@example.test`, password: 'Password123', adminCode: 'test-admin-code' }).expect(201);
    adminToken = admin.body.accessToken;
    const firstEmail = `student-${stamp}-0@example.test`;
    await request(app.getHttpServer()).post('/api/auth/register').send({ name: 'Test Student 0', email: firstEmail, password: 'Password123' }).expect(201);
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: firstEmail, password: 'Password123' }).expect(201);
    const prisma = module.get(PrismaService);
    const jwt = module.get(JwtService);
    userTokens = [login.body.accessToken as string];
    for (let i = 1; i < 20; i++) {
      const user = await prisma.user.create({ data: { name: `Test Student ${i}`, email: `student-${stamp}-${i}@example.test`, passwordHash: await bcrypt.hash('Password123', 4) } });
      userTokens.push(jwt.sign({ sub: user.id, email: user.email, role: user.role }));
    }
    const created = await request(app.getHttpServer()).post('/api/events').set('Authorization', `Bearer ${adminToken}`).send(baseEvent).expect(201);
    eventId = created.body.id;
    await request(app.getHttpServer()).post(`/api/events/${eventId}/publish`).set('Authorization', `Bearer ${adminToken}`).expect(201);
  }, 120000);
  afterAll(async () => { await app?.close(); });
  it('confirms exactly five of twenty parallel requests', async () => {
    const results = await Promise.all(userTokens.map(token => request(app.getHttpServer()).post(`/api/events/${eventId}/bookings`).set('Authorization', `Bearer ${token}`).send({})));
    expect(results.every(r => r.status === 201)).toBe(true);
    expect(results.filter(r => r.body.status === 'CONFIRMED')).toHaveLength(5);
    expect(results.filter(r => r.body.status === 'WAITLISTED')).toHaveLength(15);
  }, 180000);
  it('orders food, checks in, closes, and reads report', async () => {
    const event = await request(app.getHttpServer()).post('/api/events').set('Authorization', `Bearer ${adminToken}`).send({ ...baseEvent, title: 'End to end event', capacity: 10, safetyLimit: 10 }).expect(201);
    const id = event.body.id as string;
    const food = await request(app.getHttpServer()).post(`/api/events/${id}/food-items`).set('Authorization', `Bearer ${adminToken}`).send({ name: 'Lunch', tag: 'VEG', unitCost: 50 }).expect(201);
    await request(app.getHttpServer()).post(`/api/events/${id}/publish`).set('Authorization', `Bearer ${adminToken}`).expect(201);
    const booking = await request(app.getHttpServer()).post(`/api/events/${id}/bookings`).set('Authorization', `Bearer ${userTokens[0]}`).send({}).expect(201);
    await request(app.getHttpServer()).put(`/api/bookings/${booking.body.id}/food-order`).set('Authorization', `Bearer ${userTokens[0]}`).send({ items: [{ foodItemId: food.body.id, quantity: 1 }] }).expect(200);
    await request(app.getHttpServer()).post('/api/checkin').set('Authorization', `Bearer ${adminToken}`).send({ qrToken: booking.body.qrToken }).expect(201);
    await request(app.getHttpServer()).post('/api/food-collect').set('Authorization', `Bearer ${adminToken}`).send({ qrToken: booking.body.qrToken, items: [{ foodItemId: food.body.id, quantity: 1 }] }).expect(201);
    await request(app.getHttpServer()).post(`/api/events/${id}/close`).set('Authorization', `Bearer ${adminToken}`).expect(201);
    const report = await request(app.getHttpServer()).get(`/api/events/${id}/report`).set('Authorization', `Bearer ${adminToken}`).expect(200);
    expect(report.body.actualJson).toMatchObject({ attendance: 1, foodCollected: 1 });
  }, 120000);
});
