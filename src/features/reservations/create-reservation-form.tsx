"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { createReservationSchema, type CreateReservationInput } from "@/schemas/create-reservation";
import type { ReservationLocationOption } from "@/types/reservation";

interface ApiErrorBody {
  error?: string;
}

export function CreateReservationForm({ locations }: { locations: ReservationLocationOption[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isCreated, setIsCreated] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateReservationInput>({
    resolver: zodResolver(createReservationSchema),
    defaultValues: {
      locationId: "",
      startAt: "",
      endAt: "",
      status: "DRAFT",
      items: [{ equipmentId: "", quantity: 1 }],
    },
  });
  const { fields, append, remove, replace } = useFieldArray({ control, name: "items" });

  const locationId = useWatch({ control, name: "locationId" });
  const selectedLocation = locations.find((location) => location.id === locationId);
  const itemsError = errors.items?.message ?? errors.items?.root?.message;
  const isBusy = isSubmitting || isCreated;

  async function onSubmit(input: CreateReservationInput) {
    setServerError(null);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = (await response.json()) as ApiErrorBody;

      if (!response.ok) {
        setServerError(body.error ?? "The reservation could not be created.");
        return;
      }

      setIsCreated(true);
      router.push("/");
      router.refresh();
    } catch {
      setServerError("The server could not be reached. Please try again.");
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3}>
            <Controller
              name="locationId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Location"
                  required
                  fullWidth
                  error={Boolean(errors.locationId)}
                  helperText={errors.locationId?.message}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                    replace([{ equipmentId: "", quantity: 1 }]);
                  }}
                >
                  {locations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                {...register("startAt")}
                type="datetime-local"
                label="Start (UTC)"
                required
                fullWidth
                error={Boolean(errors.startAt)}
                helperText={errors.startAt?.message}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                {...register("endAt")}
                type="datetime-local"
                label="End (UTC)"
                required
                fullWidth
                error={Boolean(errors.endAt)}
                helperText={errors.endAt?.message}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl>
                  <FormLabel id="status-label">Status</FormLabel>
                  <RadioGroup {...field} row aria-labelledby="status-label">
                    <FormControlLabel value="DRAFT" control={<Radio />} label="Draft" />
                    <FormControlLabel value="CONFIRMED" control={<Radio />} label="Confirmed" />
                  </RadioGroup>
                </FormControl>
              )}
            />

            <Stack spacing={1.5}>
              <Typography component="h2" variant="h2">
                Equipment
              </Typography>

              {fields.map((field, index) => (
                <Stack
                  key={field.id}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ alignItems: { sm: "flex-start" } }}
                >
                  <Controller
                    name={`items.${index}.equipmentId`}
                    control={control}
                    render={({ field: equipmentField }) => (
                      <TextField
                        {...equipmentField}
                        select
                        label="Equipment"
                        required
                        fullWidth
                        disabled={!selectedLocation}
                        error={Boolean(errors.items?.[index]?.equipmentId)}
                        helperText={errors.items?.[index]?.equipmentId?.message}
                      >
                        {(selectedLocation?.equipment ?? []).map((equipment) => (
                          <MenuItem key={equipment.id} value={equipment.id}>
                            {equipment.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                  <TextField
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    type="number"
                    label="Quantity"
                    required
                    error={Boolean(errors.items?.[index]?.quantity)}
                    helperText={errors.items?.[index]?.quantity?.message}
                    slotProps={{ htmlInput: { min: 1 } }}
                    sx={{ width: { xs: "100%", sm: 160 }, flexShrink: 0 }}
                  />
                  <IconButton
                    aria-label={`Remove item ${index + 1}`}
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Stack>
              ))}

              {itemsError ? <Alert severity="error">{itemsError}</Alert> : null}

              <Button
                startIcon={<AddIcon />}
                onClick={() => append({ equipmentId: "", quantity: 1 })}
                disabled={!selectedLocation}
                sx={{ alignSelf: "flex-start" }}
              >
                Add item
              </Button>
            </Stack>

            {serverError ? <Alert severity="error">{serverError}</Alert> : null}

            <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
              <Button href="/" disabled={isBusy}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isBusy}>
                {isBusy ? "Saving…" : "Create reservation"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
