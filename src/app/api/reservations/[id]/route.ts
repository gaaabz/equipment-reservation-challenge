import { NextResponse } from "next/server";
import { DomainError } from "@/lib/domain-error";
import { reservationSchema } from "@/schemas/reservation";
import { updateReservation } from "@/server/reservations/update-reservation";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = reservationSchema.safeParse(body);

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
    const reservation = await updateReservation(id, parsed.data);
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

    console.error("Unexpected update reservation error", error);
    return NextResponse.json(
      { error: "The reservation could not be saved. Please try again.", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
