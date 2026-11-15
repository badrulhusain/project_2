export type Rates = { showRate: number; walkInRate: number; claimRate: number };
export const DEFAULT_RATES = { paid: { showRate: 0.93, walkInRate: 0.05, claimRate: 0.85 }, free: { showRate: 0.62, walkInRate: 0.10, claimRate: 0.75 } } as const;
export function attendance(booked: number, rates: Rates) {
  const likely = Math.round(booked * (rates.showRate + rates.walkInRate));
  const sd = Math.sqrt(booked * rates.showRate * (1 - rates.showRate));
  return { booked, low: Math.max(0, Math.round(likely - 1.65 * sd)), likely, high: Math.round(likely + 1.65 * sd),
    showRate: rates.showRate, walkInRate: rates.walkInRate,
    explanation: `Of ${booked} confirmed bookings, about ${Math.round(booked * rates.showRate)} are expected to arrive, plus ${Math.round(booked * rates.walkInRate)} walk-ins.` };
}
export function seats(likely: number, capacity: number, isPaid: boolean) {
  const utilization = capacity ? likely / capacity : 0;
  const status = utilization > 1 ? 'OVER' : utilization >= 0.85 ? 'TIGHT' : 'OK';
  return { effectiveCapacity: capacity, utilization, status,
    suggestion: status === 'OVER' ? 'Release more seats or use a larger venue.' : status === 'TIGHT' ? 'Open the waitlist if seats become free.' : 'Venue has spare capacity.',
    overbookSuggestion: isPaid ? 0 : Math.max(0, Math.floor(capacity / 0.72) - capacity) };
}
export type FoodInput = { id: string; name: string; unitCost: number | null; ordered: number };
export function food(items: FoodInput[], forecast: ReturnType<typeof attendance>, rates: Rates) {
  const totalOrdered = items.reduce((sum, x) => sum + x.ordered, 0);
  const walkIns = forecast.booked * rates.walkInRate;
  const output = items.map(item => {
    const walkInShare = totalOrdered ? item.ordered / totalOrdered * walkIns * 0.5 : 0;
    const recommended = Math.ceil((item.ordered * rates.claimRate + walkInShare) * 1.05);
    const low = forecast.likely ? Math.ceil(recommended * forecast.low / forecast.likely) : 0;
    const high = forecast.likely ? Math.ceil(recommended * forecast.high / forecast.likely) : 0;
    const risk = recommended > item.ordered * 1.1 ? 'SHORTAGE_RISK' : recommended < item.ordered * 0.9 ? 'WASTE_RISK' : 'BALANCED';
    return { item: { id: item.id, name: item.name }, ordered: item.ordered, recommended, low, high, risk, unitCost: item.unitCost };
  });
  const recommendedTotal = output.reduce((sum, x) => sum + x.recommended, 0);
  return { items: output, manualGuess: forecast.booked, recommendedTotal, mealsSaved: Math.max(0, forecast.booked - recommendedTotal),
    estimatedCostSaved: output.reduce((sum, x) => sum + Math.max(0, x.ordered - x.recommended) * (x.unitCost ?? 0), 0) };
}
export function parking(zones: { id: string; name: string; capacity: number; booked: number }[], rates: Rates) {
  return zones.map(zone => { const expectedDemand = Math.round(zone.booked * rates.showRate); const utilization = zone.capacity ? expectedDemand / zone.capacity : 0;
    return { ...zone, expectedDemand, utilization, status: utilization > 1 ? 'OVER' : utilization >= 0.85 ? 'TIGHT' : 'OK' }; });
}
export type EquipmentInput = { name: string; watts: number; count: number; startAt: Date; endAt: Date; occupancyScaled: boolean };
export function power(startAt: Date, endAt: Date, equipment: EquipmentInput[], likely: number, effectiveCapacity: number, powerLimitKw: number) {
  const points: { time: string; loadKw: number }[] = [];
  for (let time = startAt.getTime(); time < endAt.getTime(); time += 30 * 60000) {
    const loadKw = equipment.filter(e => e.startAt.getTime() <= time && e.endAt.getTime() > time)
      .reduce((sum, e) => sum + e.watts * e.count / 1000 * (e.occupancyScaled ? Math.max(0.3, effectiveCapacity ? likely / effectiveCapacity : 0.3) : 1), 0);
    points.push({ time: new Date(time).toISOString(), loadKw: Math.round(loadKw * 100) / 100 });
  }
  const peak = points.reduce((best, x) => x.loadKw > best.loadKw ? x : best, { time: startAt.toISOString(), loadKw: 0 });
  const status = peak.loadKw > powerLimitKw ? 'OVERLOAD' : peak.loadKw >= powerLimitKw * 0.8 ? 'WARNING' : 'OK';
  return { points, peakKw: peak.loadKw, peakTime: peak.time, powerLimitKw, headroomKw: powerLimitKw - peak.loadKw, status,
    recommendation: status === 'OK' ? 'Power load is within limit.' : 'Stagger high-power equipment start times.' };
}
