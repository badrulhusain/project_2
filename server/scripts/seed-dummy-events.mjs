// Usage: node scripts/seed-dummy-events.mjs [organizerEmail]
// Adds 5 published demo events owned by the given user (default: the platform admin).
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const email = (process.argv[2] ?? 'evet@manage.com').toLowerCase();
const owner = await prisma.user.findUnique({ where: { email } });
if (!owner) { console.error(`User not found: ${email}`); process.exit(1); }

const day = 86400000; const hour = 3600000;
const at = (days, hours) => { const d = new Date(Date.now() + days * day); d.setHours(hours, 0, 0, 0); return d; };

const events = [
  { title: 'Innovators Connect Summit', description: 'A day of talks, live demos and hallway conversations with student founders and industry mentors. Bring your ideas and your questions.', venue: 'Main Auditorium', type: 'SEMINAR', isPaid: false, capacity: 250, powerLimitKw: 30, days: 6, from: 10, hours: 6,
    food: [['Tea & biscuits', 'VEG', 20], ['Working lunch box', 'VEG', 120], ['Chicken biryani', 'NON_VEG', 150]], parking: [['North lot', 'FOUR_WHEELER', 60], ['Bike shed', 'TWO_WHEELER', 120]] },
  { title: 'Rhythm & Roots Cultural Night', description: 'An evening of music, dance and storytelling celebrating the many cultures on campus, followed by a shared dinner.', venue: 'Open Air Theatre', type: 'CULTURAL', isPaid: false, capacity: 400, powerLimitKw: 45, days: 9, from: 17, hours: 5,
    food: [['Festival thali', 'VEG', 100], ['Pav bhaji', 'VEG', 80], ['Ice cream cup', 'VEG', 40]], parking: [['East gate lot', 'FOUR_WHEELER', 80], ['Bike shed', 'TWO_WHEELER', 150]] },
  { title: 'Hands-on Web Dev Workshop', description: 'Build and deploy a real web app in one afternoon. Laptops required; starter code and mentors are provided.', venue: 'Computer Lab 2', type: 'WORKSHOP', isPaid: true, capacity: 60, powerLimitKw: 15, days: 12, from: 14, hours: 4,
    food: [['Tea & snacks', 'VEG', 30], ['Cold coffee', 'VEG', 50]], parking: [['Library lot', 'FOUR_WHEELER', 25]] },
  { title: 'Aisha & Rahim Wedding Reception', description: 'You are warmly invited to celebrate the wedding reception of Aisha and Rahim with family and friends. Blessings and a grand dinner await.', venue: 'Crescent Convention Hall', type: 'WEDDING', isPaid: false, capacity: 300, powerLimitKw: 60, days: 16, from: 18, hours: 5,
    food: [['Wedding feast (veg)', 'VEG', 300], ['Mutton biryani', 'NON_VEG', 300], ['Payasam / dessert', 'VEG', 300], ['Welcome drink', 'VEG', 300]], parking: [['Hall front', 'FOUR_WHEELER', 90], ['Side lane', 'TWO_WHEELER', 100]] },
  { title: 'Alumni Meetup & Networking Evening', description: 'Reconnect with batchmates, meet recent graduates and swap stories over snacks. Open to every batch.', venue: 'Rooftop Lounge, Admin Block', type: 'CUSTOM', customType: 'Alumni meetup', isPaid: false, capacity: 120, powerLimitKw: 20, days: 21, from: 17, hours: 4,
    food: [['Snack box', 'VEG', 120], ['Sandwich & juice', 'VEG', 120], ['Vegan wrap', 'VEGAN', 40]], parking: [['Admin lot', 'FOUR_WHEELER', 50]] },
];

let made = 0;
for (const e of events) {
  const startAt = at(e.days, e.from);
  const endAt = new Date(startAt.getTime() + e.hours * hour);
  const event = await prisma.event.create({
    data: {
      title: e.title, description: e.description, venue: e.venue, type: e.type, customType: e.customType ?? null, isPaid: e.isPaid,
      capacity: e.capacity, safetyLimit: e.capacity, powerLimitKw: e.powerLimitKw, startAt, endAt,
      bookingCutoffAt: new Date(startAt.getTime() - 2 * hour), foodCutoffAt: new Date(startAt.getTime() - day),
      status: 'PUBLISHED', createdById: owner.id, organizationId: owner.organizationId,
      foodItems: { create: e.food.map(([name, tag, maxQuantity]) => ({ name, tag, maxQuantity })) },
      parkingZones: { create: e.parking.map(([name, vehicleType, capacity]) => ({ name, vehicleType, capacity })) },
    },
  });
  made++;
  console.log(`+ ${event.title} (${e.type}) ${startAt.toISOString().slice(0, 10)}`);
}
console.log(`Created ${made} events for ${owner.email}`);
await prisma.$disconnect();
