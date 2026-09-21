import { NextResponse } from "next/server";
import { DomainError } from "@/lib/domain-error";
import { reservationNoteSchema } from "@/schemas/reservation-note";
import { updateReservationNote } from "@/server/reservations/update-reservation-note";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = reservationNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid request.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 },
      );
    }

    const { id } = await context.params;
    const reservation = await updateReservationNote(id, parsed.data);
    return NextResponse.json({ reservation });
  } catch (error: unknown) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Request body must be valid JSON.", code: "INVALID_JSON" },
        { status: 400 },
      );
    }

    console.error("Unexpected reservation note error", error);
    return NextResponse.json(
      { error: "The note could not be saved. Please try again.", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
