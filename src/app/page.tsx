import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Stack, Typography } from "@mui/material";
import { EmptyReservations } from "@/features/reservations/empty-reservations";
import { ReservationList } from "@/features/reservations/reservation-list";
import { listReservations } from "@/server/reservations/list-reservations";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const reservations = await listReservations();

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box>
          <Typography component="h1" variant="h1" gutterBottom>
            Reservations
          </Typography>
          <Typography color="text.secondary">
            Review equipment bookings across Austin and Dallas. Times are shown in UTC.
          </Typography>
        </Box>
        <Button
          href="/reservations/new"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ flexShrink: 0 }}
        >
          New Reservation
        </Button>
      </Box>

      {reservations.length === 0 ? <EmptyReservations /> : <ReservationList reservations={reservations} />}
    </Stack>
  );
}
