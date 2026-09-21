import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { ReservationForm } from "@/features/reservations/reservation-form";
import { listReservationOptions } from "@/server/reservations/list-reservation-options";

export const dynamic = "force-dynamic";

export default async function NewReservationPage() {
  const locations = await listReservationOptions();
  const hasEquipment = locations.some((location) => location.equipment.length > 0);

  return (
    <Stack spacing={3}>
      <Box>
        <Button href="/" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          Back to reservations
        </Button>
        <Typography component="h1" variant="h1" gutterBottom>
          New Reservation
        </Typography>
        <Typography color="text.secondary">
          Reserve equipment for a location and time window. Times are entered in UTC.
        </Typography>
      </Box>

      {hasEquipment ? (
        <ReservationForm locations={locations} />
      ) : (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              No locations with equipment are available yet.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
