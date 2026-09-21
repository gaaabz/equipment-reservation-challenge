import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";

export default function NewReservationPage() {
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
          This route is the starting point for Ticket 2 of the assessment.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stack spacing={2.5}>
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ alignItems: "center", flexWrap: "wrap" }}
            >
              <Chip label="Candidate task" color="secondary" size="small" />
              <Typography component="h2" variant="h2">
                Implement Create Reservation
              </Typography>
            </Stack>
            <Divider />
            <Typography>
              Build a form for location, start and end date/time, one or more equipment items with
              quantities, and Draft or Confirmed status.
            </Typography>
            <Typography color="text.secondary">
              Use the existing note editor for the project&apos;s React Hook Form, Zod, API, domain-error,
              and refresh conventions. The README contains the complete acceptance rules.
            </Typography>
            {/* TODO(candidate): Implement the Create Reservation form. */}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
