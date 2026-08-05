import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as settingsApi from "../../api/settings.api";

import SettingsCard from "./SettingsCard";
import Input from "../common/Input";
import Button from "../common/Button";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * OfficeTimingForm
 * Edits officeStartTime / officeEndTime (PATCH /settings) — the daily
 * window used to derive on-time vs. late attendance server-side.
 *
 * Props:
 *  - settings: { officeStartTime, officeEndTime, ... } — current org settings
 *  - canEdit:  bool — false renders the fields read-only (viewer roles)
 *  - onSaved:  fn(updatedSettings) — called after a successful PATCH
 */
const OfficeTimingForm = ({ settings, canEdit = false, onSaved }) => {
  const [serverError, setServerError] = useState("");
  const [savedAt, setSavedAt] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      officeStartTime: settings?.officeStartTime || "09:30",
      officeEndTime: settings?.officeEndTime || "17:30",
    },
  });

  // Keep the form in sync if the parent page (re)loads settings.
  useEffect(() => {
    reset({
      officeStartTime: settings?.officeStartTime || "09:30",
      officeEndTime: settings?.officeEndTime || "17:30",
    });
  }, [settings, reset]);

  const onSubmit = async (values) => {
    setServerError("");
    setSavedAt(null);
    try {
      const res = await settingsApi.updateSettings({
        officeStartTime: values.officeStartTime,
        officeEndTime: values.officeEndTime,
      });
      const updated = res?.data?.data?.settings;
      setSavedAt(new Date());
      reset({
        officeStartTime: updated?.officeStartTime || values.officeStartTime,
        officeEndTime: updated?.officeEndTime || values.officeEndTime,
      });
      onSaved?.(updated);
    } catch (error) {
      setServerError(
        error?.response?.data?.message || "Unable to update office timing. Please try again."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <SettingsCard
        title="Office Timing"
        description="The daily window used to mark employees present vs. late."
        footer={
          canEdit && (
            <div className="flex items-center gap-3">
              <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
                Save changes
              </Button>
              {savedAt && !isDirty && (
                <span className="text-xs text-gray-400">Saved</span>
              )}
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
            type="time"
            label="Office start time"
            disabled={!canEdit}
            error={errors.officeStartTime?.message}
            {...register("officeStartTime", {
              required: "Office start time is required",
              pattern: { value: TIME_REGEX, message: "Must be in HH:mm format" },
            })}
          />
          <Input
            type="time"
            label="Office end time"
            disabled={!canEdit}
            error={errors.officeEndTime?.message}
            {...register("officeEndTime", {
              required: "Office end time is required",
              pattern: { value: TIME_REGEX, message: "Must be in HH:mm format" },
            })}
          />
        </div>
      </SettingsCard>
    </form>
  );
};

export default OfficeTimingForm;
