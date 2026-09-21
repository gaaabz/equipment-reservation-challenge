import { DomainError } from "@/lib/domain-error";
import { prisma } from "@/lib/prisma";

interface AvailabilityInput {
  locationId: string;
  equipmentId: string;
  startAt: Date;
  endAt: Date;
}

interface AvailabilityCheckInput extends AvailabilityInput {
  requestedQuantity: number;
}

export async function getAvailableQuantity(input: AvailabilityInput): Promise<number> {
  if (input.endAt <= input.startAt) {
    throw new DomainError("End time must be after start time.", 400, "INVALID_INTERVAL");
  }

  const equipment = await prisma.equipment.findFirst({
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

  // Availability behavior is part of the candidate challenge.
  const reservations = await prisma.reservation.findMany({
    where: {
      locationId: input.locationId,
      status: "CONFIRMED",
      startAt: { lte: input.endAt },
      endAt: { gte: input.startAt },
      items: { some: { equipmentId: input.equipmentId } },
    },
    select: {
      items: {
        where: { equipmentId: input.equipmentId },
        select: { quantity: true },
      },
    },
  });

  const reservedQuantity = reservations.reduce(
    (sum, reservation) => sum + reservation.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  return Math.max(0, equipment.totalQuantity - reservedQuantity);
}

export async function checkAvailability(
  input: AvailabilityCheckInput,
): Promise<{ available: boolean; availableQuantity: number }> {
  if (!Number.isInteger(input.requestedQuantity) || input.requestedQuantity <= 0) {
    throw new DomainError("Quantity must be a positive whole number.", 400, "INVALID_QUANTITY");
  }

  const availableQuantity = await getAvailableQuantity(input);
  return {
    available: input.requestedQuantity <= availableQuantity,
    availableQuantity,
  };
}
