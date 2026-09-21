import { Card, CardContent, Skeleton, Stack } from "@mui/material";

export default function Loading() {
  return (
    <Stack spacing={2} aria-label="Loading reservations">
      <Skeleton variant="text" width={260} height={52} />
      <Skeleton variant="text" width="55%" />
      <Card>
        <CardContent>
          <Skeleton variant="rectangular" height={260} />
        </CardContent>
      </Card>
    </Stack>
  );
}
