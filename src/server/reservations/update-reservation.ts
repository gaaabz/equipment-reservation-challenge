import { DomainError } from "@/lib/domain-error";
import { prisma } from "@/lib/prisma";
import { parseUtcDateTime, type ReservationInput } from "@/schemas/reservation";
import { assertReservationAvailability } from "@/server/reservations/availability";

export async function updateReservation(id: string, input: ReservationInput): Promise<{ id: string }> {
  const startAt = parseUtcDateTime(input.startAt);
  const endAt = parseUtcDateTime(input.endAt);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.reservation.findUnique({ where: { id }, select: { id: true } });

    if (!existing) {
      throw new DomainError("Reservation not found.", 404, "RESERVATION_NOT_FOUND");
    }

    await assertReservationAvailability(
      {
        locationId: input.locationId,
        startAt,
        endAt,
        status: input.status,
        items: input.items,
        excludeReservationId: id,
      },
      tx,
    );

    await tx.reservationItem.deleteMany({ where: { reservationId: id } });

    await tx.reservation.update({
      where: { id },
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
    });

    return { id };
  });
}
