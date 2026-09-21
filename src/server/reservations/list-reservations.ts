import { prisma } from "@/lib/prisma";
import type { ReservationListItem } from "@/types/reservation";

export async function listReservations(): Promise<ReservationListItem[]> {
  const reservations = await prisma.reservation.findMany({
    orderBy: [{ startAt: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      startAt: true,
      endAt: true,
      status: true,
      note: true,
      location: { select: { name: true } },
      items: {
        orderBy: { equipment: { name: "asc" } },
        select: {
          quantity: true,
          equipment: { select: { id: true, name: true } },
        },
      },
    },
  });

  return reservations.map((reservation) => ({
    id: reservation.id,
    locationName: reservation.location.name,
    startAt: reservation.startAt.toISOString(),
    endAt: reservation.endAt.toISOString(),
    status: reservation.status,
    note: reservation.note,
    equipment: reservation.items.map((item) => ({
      id: item.equipment.id,
      name: item.equipment.name,
      quantity: item.quantity,
    })),
  }));
}
