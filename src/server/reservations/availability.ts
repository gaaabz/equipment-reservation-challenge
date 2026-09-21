import { DomainError } from "@/lib/domain-error";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { ReservationStatusValue } from "@/types/reservation";

interface AvailabilityInput {
  locationId: string;
  equipmentId: string;
  startAt: Date;
  endAt: Date;
  excludeReservationId?: string;
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
      ...(input.excludeReservationId ? { id: { not: input.excludeReservationId } } : {}),
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

interface AssertReservationAvailabilityInput {
  locationId: string;
  startAt: Date;
  endAt: Date;
  status: ReservationStatusValue;
  items: { equipmentId: string; quantity: number }[];
  excludeReservationId?: string;
}

export async function assertReservationAvailability(
  input: AssertReservationAvailabilityInput,
  db: Prisma.TransactionClient = prisma,
): Promise<void> {
  const equipment = await db.equipment.findMany({
    where: { locationId: input.locationId, id: { in: input.items.map((item) => item.equipmentId) } },
    select: { id: true, name: true },
  });
  const equipmentById = new Map(equipment.map((item) => [item.id, item]));

  for (const item of input.items) {
    if (!equipmentById.has(item.equipmentId)) {
      throw new DomainError(
        "Selected equipment was not found at the selected location.",
        404,
        "EQUIPMENT_NOT_FOUND",
      );
    }
  }

  if (input.status === "CONFIRMED") {
    for (const item of input.items) {
      const available = await getAvailableQuantity(
        {
          locationId: input.locationId,
          equipmentId: item.equipmentId,
          startAt: input.startAt,
          endAt: input.endAt,
          excludeReservationId: input.excludeReservationId,
        },
        db,
      );

      if (item.quantity > available) {
        const name = equipmentById.get(item.equipmentId)!.name;
        const message =
          available === 0
            ? `No ${name}s are available for the selected period.`
            : available === 1
              ? `Only 1 ${name} is available for the selected period.`
              : `Only ${available} ${name}s are available for the selected period.`;
        throw new DomainError(message, 409, "AVAILABILITY_EXCEEDED");
      }
    }
  }
}
