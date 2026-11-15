import 'dotenv/config';
import { PrismaClient, EventType } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
const prisma = new PrismaClient();
const now = Date.now();
const day = 86400000;
async function main() {
  const admin = await prisma.user.upsert({ where: { email: 'admin@eventsense.dev' }, update: {}, create: { name: 'Demo Admin', email: 'admin@eventsense.dev', passwordHash: await bcrypt.hash('Admin@123', 12), role: 'ADMIN' } });
  const users = [];
  for (let i = 1; i <= 5; i++) users.push(await prisma.user.upsert({ where: { email: `student${i}@eventsense.dev` }, update: {}, create: { name: `Student ${i}`, email: `student${i}@eventsense.dev`, passwordHash: await bcrypt.hash('Student@123', 12) } }));
  for (const type of Object.values(EventType)) for (const isPaid of [false, true]) {
    await prisma.calibrationStat.upsert({ where: { eventType_isPaid: { eventType: type, isPaid } }, update: {}, create: { eventType: type, isPaid, showRate: isPaid ? 0.93 : 0.62, walkInRate: isPaid ? 0.05 : 0.10, claimRate: isPaid ? 0.85 : 0.75, samples: 0 } });
  }
  const demo = await prisma.event.create({ data: { title: 'Campus Innovation Fest', description: 'A full-day student innovation showcase', venue: 'Main Auditorium', startAt: new Date(now + 7 * day), endAt: new Date(now + 7 * day + 8 * 3600000), type: 'FEST', isPaid: false, capacity: 500, safetyLimit: 450, powerLimitKw: 80, bookingCutoffAt: new Date(now + 6 * day), foodCutoffAt: new Date(now + 5 * day), seatReleaseAt: new Date(now + 7 * day + 3600000), status: 'PUBLISHED', createdById: admin.id } });
  const workshop = await prisma.event.create({ data: { title: 'Robotics Workshop', description: 'Hands-on robotics lab', venue: 'Engineering Lab 2', startAt: new Date(now + 14 * day), endAt: new Date(now + 14 * day + 4 * 3600000), type: 'WORKSHOP', isPaid: true, capacity: 80, safetyLimit: 70, powerLimitKw: 20, bookingCutoffAt: new Date(now + 13 * day), foodCutoffAt: new Date(now + 12 * day), status: 'PUBLISHED', createdById: admin.id } });
  const veg = await prisma.foodItem.create({ data: { eventId: demo.id, name: 'Veg thali', tag: 'VEG', unitCost: 120, maxQuantity: 500 } });
  const nonveg = await prisma.foodItem.create({ data: { eventId: demo.id, name: 'Chicken biryani', tag: 'NON_VEG', unitCost: 160, maxQuantity: 300 } });
  await prisma.foodItem.create({ data: { eventId: workshop.id, name: 'Sandwich', tag: 'VEG', unitCost: 60 } });
  const bike = await prisma.parkingZone.create({ data: { eventId: demo.id, name: 'North Bikes', vehicleType: 'TWO_WHEELER', capacity: 250 } });
  const car = await prisma.parkingZone.create({ data: { eventId: demo.id, name: 'East Cars', vehicleType: 'FOUR_WHEELER', capacity: 100 } });
  for (const [name, watts, count, offset, duration, occupancyScaled] of [['Stage lighting', 500, 20, 0, 8, false], ['Air conditioning', 1800, 18, 0, 8, true], ['Projectors', 350, 8, 1, 6, false]] as const) {
    await prisma.equipment.create({ data: { eventId: demo.id, name, watts, count, startAt: new Date(demo.startAt.getTime() + offset * 3600000), endAt: new Date(demo.startAt.getTime() + (offset + duration) * 3600000), occupancyScaled } });
  }
  await prisma.notification.createMany({ data: [
    { eventId: demo.id, title: 'Welcome', body: 'The festival opens soon.', type: 'INFO', scheduledAt: new Date(now + day), createdById: admin.id },
    { eventId: demo.id, title: 'Food collection', body: 'Collect meals near the auditorium.', type: 'FOOD', scheduledAt: new Date(now + 7 * day), createdById: admin.id },
  ] });
  // Five login-ready students plus 395 distinct demo accounts preserve the event/user unique key.
  const demoPasswordHash = await bcrypt.hash(randomUUID(), 12);
  const demoUsers = Array.from({ length: 395 }, (_, i) => ({ id: randomUUID(), name: `Demo Attendee ${i + 6}`, email: `demo${i + 6}@eventsense.dev`, passwordHash: demoPasswordHash }));
  await prisma.user.createMany({ data: demoUsers });
  const attendeeIds = [...users.map(user => user.id), ...demoUsers.map(user => user.id)];
  const bookings = attendeeIds.map((userId, i) => ({ id: randomUUID(), eventId: demo.id, userId, status: 'CONFIRMED' as const, qrToken: randomUUID(), parkingZoneId: i % 6 === 0 ? car.id : i % 3 === 0 ? bike.id : null }));
  await prisma.booking.createMany({ data: bookings });
  const orders = bookings.map(booking => ({ id: randomUUID(), bookingId: booking.id }));
  await prisma.foodOrder.createMany({ data: orders });
  await prisma.foodOrderItem.createMany({ data: orders.map((order, i) => ({ orderId: order.id, foodItemId: i % 3 === 0 ? nonveg.id : veg.id, quantity: 1 })) });
  console.log(`Seeded events ${demo.id} and ${workshop.id}; admin@eventsense.dev / Admin@123`);
}
main().finally(() => prisma.$disconnect());
