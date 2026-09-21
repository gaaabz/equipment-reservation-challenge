import { DomainError } from "@/lib/domain-error";
import { prisma } from "@/lib/prisma";
import type { ReservationNoteInput } from "@/schemas/reservation-note";

export async function updateReservationNote(
  reservationId: string,
  input: ReservationNoteInput,
): Promise<{ id: string; note: string }> {
  const existing = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: { id: true },
  });

  if (!existing) {
    throw new DomainError("Reservation not found.", 404, "RESERVATION_NOT_FOUND");
  }

  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: { note: input.note },
    select: { id: true, note: true },
  });

  return { id: updated.id, note: updated.note ?? input.note };
}
