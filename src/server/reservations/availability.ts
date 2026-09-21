import { DomainError } from "@/lib/domain-error";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

interface AvailabilityInput {
  locationId: string;
  equipmentId: string;
  startAt: Date;
  endAt: Date;
}

interface AvailabilityCheckInput extends AvailabilityInput {
  requestedQuantity: number;
}

export async function getAvailableQuantity(
  input: AvailabilityInput,
  db: Prisma.TransactionClient = prisma,
): Promise<number> {
  if (input.endAt <= input.startAt) {
    throw new DomainError("End time must be after start time.", 400, "INVALID_INTERVAL");
  }

  const equipment = await db.equipment.findFirst({
    where: { id: input.equipmentId, locationId: input.locationId },
    select: { totalQuantity: true },
  });

  if (!equipment) {
    throw new DomainError(
      "Equipment was not found at the selected location.",
      404,
      "EQUIPMENT_NOT_FOUND",
    );
  }
  const reservations = await db.reservation.findMany({
    where: {
      locationId: input.locationId,
      status: "CONFIRMED",
      startAt: { lt: input.endAt },
      endAt: { gt: input.startAt },
      items: { some: { equipmentId: input.equipmentId } },
    },
    select: {
      startAt: true,
      endAt: true,
      items: {
        where: { equipmentId: input.equipmentId },
        select: { quantity: true },
      },
    },
  });

  /**
   * const reservedQuantity = reservations.reduce(
   *   (sum, reservation) => sum + reservation.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
   *   0,
   * );
   * return Math.max(0, equipment.totalQuantity - reservedQuantity);
   */

  return Math.max(0, equipment.totalQuantity - getPeakReservedQuantity(reservations));
}

/**
 * Let's name the 4 Generators: A, B, C, D.
 *
 *               09:00 ──── 11:00 ──── 12:00 ──── 13:00 ──── 15:00
 * Morning (2)     [ A  B ───────────────)
 * Afternoon (2)                         [ A  B ───────────────)
 * Free                C  D       C  D       C  D       C  D
 * New 11–13                  [ C  D ───────────────)   ✓
 */
function getPeakReservedQuantity(
  reservations: { startAt: Date; endAt: Date; items: { quantity: number }[] }[],
): number {
  const events = reservations.flatMap((reservation) => {
    const quantity = reservation.items.reduce((sum, item) => sum + item.quantity, 0);
    return [
      { time: reservation.startAt.getTime(), delta: quantity },
      { time: reservation.endAt.getTime(), delta: -quantity },
    ];
  });
  events.sort((a, b) => a.time - b.time || a.delta - b.delta);

  let current = 0;
  let peak = 0;
  for (const event of events) {
    current += event.delta;
    peak = Math.max(peak, current);
  }
  return peak;
}

export async function checkAvailability(
  input: AvailabilityCheckInput,
  db: Prisma.TransactionClient = prisma,
): Promise<{ available: boolean; availableQuantity: number }> {
  if (!Number.isInteger(input.requestedQuantity) || input.requestedQuantity <= 0) {
    throw new DomainError("Quantity must be a positive whole number.", 400, "INVALID_QUANTITY");
  }

  const availableQuantity = await getAvailableQuantity(input, db);
  return {
    available: input.requestedQuantity <= availableQuantity,
    availableQuantity,
  };
}
