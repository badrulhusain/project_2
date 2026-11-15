import { Injectable } from '@nestjs/common';
import { EventType, Prisma } from '@prisma/client';
import { DEFAULT_RATES } from '../planner/forecast.js';
@Injectable() export class CalibrationService {
  async update(tx: Prisma.TransactionClient, type: EventType, isPaid: boolean, booked: number, checkedIn: number, ordered: number, collected: number) {
    const old = await tx.calibrationStat.findUnique({ where: { eventType_isPaid: { eventType: type, isPaid } } });
    const baseline = old ?? { ...DEFAULT_RATES[isPaid ? 'paid' : 'free'], samples: 0 };
    const blend = (previous: number, observed: number) => Math.max(0, Math.min(1, 0.7 * previous + 0.3 * observed));
    return tx.calibrationStat.upsert({ where: { eventType_isPaid: { eventType: type, isPaid } },
      create: { eventType: type, isPaid, showRate: blend(baseline.showRate, booked ? checkedIn / booked : 0), walkInRate: baseline.walkInRate, claimRate: blend(baseline.claimRate, ordered ? collected / ordered : 0), samples: 1 },
      update: { showRate: blend(baseline.showRate, booked ? checkedIn / booked : 0), claimRate: blend(baseline.claimRate, ordered ? collected / ordered : 0), samples: { increment: 1 } } });
  }
}
