import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { ReservationForm } from "@/features/reservations/reservation-form";
import { getReservation } from "@/server/reservations/get-reservation";
import { listReservationOptions } from "@/server/reservations/list-reservation-options";

export const dynamic = "force-dynamic";

export default async function EditReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [reservation, locations] = await Promise.all([getReservation(id), listReservationOptions()]);

  if (!reservation) {
    notFound();
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Button href="/" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          Back to reservations
        </Button>
        <Typography component="h1" variant="h1" gutterBottom>
          Edit Reservation
        </Typography>
        <Typography color="text.secondary">
          Update the location, time window, status, or equipment. Times are in UTC.
        </Typography>
      </Box>

      <ReservationForm locations={locations} reservationId={id} defaultValues={reservation} />
    </Stack>
  );
}
