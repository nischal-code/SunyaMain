import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as settingsApi from "../../api/settings.api";

import SettingsCard from "./SettingsCard";
import Input from "../common/Input";
import Button from "../common/Button";

/**
 * MinWorkingHoursForm
 * Edits minWorkingHours and halfDayThresholdHours (PATCH /settings) — the
 * thresholds used to derive a full-day vs. half-day attendance status from
 * an employee's clocked hours.
 *
 * Props:
 *  - settings: { minWorkingHours, halfDayThresholdHours, ... } — current org settings
 *  - canEdit:  bool — false renders the fields read-only (viewer roles)
 *  - onSaved:  fn(updatedSettings) — called after a successful PATCH
 */
const MinWorkingHoursForm = ({ settings, canEdit = false, onSaved }) => {
  const [serverError, setServerError] = useState("");
  const [savedAt, setSavedAt] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      minWorkingHours: settings?.minWorkingHours ?? 8,
      halfDayThresholdHours: settings?.halfDayThresholdHours ?? 4,
    },
  });

  useEffect(() => {
    reset({
      minWorkingHours: settings?.minWorkingHours ?? 8,
      halfDayThresholdHours: settings?.halfDayThresholdHours ?? 4,
    });
  }, [settings, reset]);

  const minWorkingHours = watch("minWorkingHours");

  const onSubmit = async (values) => {
    setServerError("");
    setSavedAt(null);
    try {
      const res = await settingsApi.updateSettings({
        minWorkingHours: Number(values.minWorkingHours),
        halfDayThresholdHours: Number(values.halfDayThresholdHours),
      });
      const updated = res?.data?.data?.settings;
      setSavedAt(new Date());
      reset({
        minWorkingHours: updated?.minWorkingHours ?? values.minWorkingHours,
        halfDayThresholdHours: updated?.halfDayThresholdHours ?? values.halfDayThresholdHours,
      });
      onSaved?.(updated);
    } catch (error) {
      setServerError(
        error?.response?.data?.message ||
          "Unable to update the working-hours thresholds. Please try again."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <SettingsCard
        title="Minimum Working Hours"
        description="Thresholds used to mark a day as full, half-day, or absent."
        footer={
          canEdit && (
            <div className="flex items-center gap-3">
              <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
                Save changes
              </Button>
              {savedAt && !isDirty && <span className="text-xs text-gray-400">Saved</span>}
            </div>
          )
        }
      >
        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            type="number"
            min={1}
            max={24}
            step={0.5}
            label="Minimum working hours"
            disabled={!canEdit}
            error={errors.minWorkingHours?.message}
            helperText={!errors.minWorkingHours ? "Full working day, between 1 and 24 hours" : undefined}
            {...register("minWorkingHours", {
              required: "Minimum working hours is required",
              min: { value: 1, message: "Must be at least 1 hour" },
              max: { value: 24, message: "Must be at most 24 hours" },
            })}
          />
          <Input
            type="number"
            min={1}
            max={12}
            step={0.5}
            label="Half-day threshold (hours)"
            disabled={!canEdit}
            error={errors.halfDayThresholdHours?.message}
            helperText={
              !errors.halfDayThresholdHours ? "Clocked hours below this count as half-day" : undefined
            }
            {...register("halfDayThresholdHours", {
              required: "Half-day threshold is required",
              min: { value: 1, message: "Must be at least 1 hour" },
              max: { value: 12, message: "Must be at most 12 hours" },
              validate: (value) =>
                Number(value) < Number(minWorkingHours) ||
                "Must be less than the minimum working hours",
            })}
          />
        </div>
      </SettingsCard>
    </form>
  );
};

export default MinWorkingHoursForm;
