import { DomainError } from "@/lib/domain-error";
import { prisma } from "@/lib/prisma";
import { parseUtcDateTime, type CreateReservationInput } from "@/schemas/create-reservation";
import { getAvailableQuantity } from "@/server/reservations/availability";

export async function createReservation(input: CreateReservationInput): Promise<{ id: string }> {
  const startAt = parseUtcDateTime(input.startAt);
  const endAt = parseUtcDateTime(input.endAt);

  return prisma.$transaction(async (tx) => {
    const equipment = await tx.equipment.findMany({
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
          { locationId: input.locationId, equipmentId: item.equipmentId, startAt, endAt },
          tx,
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

    const reservation = await tx.reservation.create({
      data: {
        locationId: input.locationId,
        startAt,
        endAt,
        status: input.status,
        items: {
          create: input.items.map((item) => ({
            equipmentId: item.equipmentId,
            quantity: item.quantity,
          })),
        },
      },
      select: { id: true },
    });

    return { id: reservation.id };
  });
}
