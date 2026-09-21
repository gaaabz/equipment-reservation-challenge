import { prisma } from "@/lib/prisma";
import { formatUtcDateTime, type ReservationInput } from "@/schemas/reservation";

export async function getReservation(id: string): Promise<ReservationInput | null> {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    select: {
      locationId: true,
      startAt: true,
      endAt: true,
      status: true,
      items: {
        orderBy: { equipment: { name: "asc" } },
        select: { equipmentId: true, quantity: true },
      },
    },
  });

  if (!reservation) {
    return null;
  }

  return {
    locationId: reservation.locationId,
    startAt: formatUtcDateTime(reservation.startAt),
    endAt: formatUtcDateTime(reservation.endAt),
    status: reservation.status,
    items: reservation.items.map((item) => ({
      equipmentId: item.equipmentId,
      quantity: item.quantity,
    })),
  };
}
