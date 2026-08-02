import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as settingsApi from "../../api/settings.api";

import SettingsCard from "./SettingsCard";
import Input from "../common/Input";
import Button from "../common/Button";

/**
 * GracePeriodForm
 * Edits gracePeriodMinutes (PATCH /settings) — how many minutes after
 * officeStartTime an employee can still clock in and be marked present
 * rather than late.
 *
 * Props:
 *  - settings: { gracePeriodMinutes, ... } — current org settings
 *  - canEdit:  bool — false renders the field read-only (viewer roles)
 *  - onSaved:  fn(updatedSettings) — called after a successful PATCH
 */
const GracePeriodForm = ({ settings, canEdit = false, onSaved }) => {
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
      gracePeriodMinutes: settings?.gracePeriodMinutes ?? 15,
    },
  });

  useEffect(() => {
    reset({ gracePeriodMinutes: settings?.gracePeriodMinutes ?? 15 });
  }, [settings, reset]);

  const onSubmit = async (values) => {
    setServerError("");
    setSavedAt(null);
    try {
      const res = await settingsApi.updateSettings({
        gracePeriodMinutes: Number(values.gracePeriodMinutes),
      });
      const updated = res?.data?.data?.settings;
      setSavedAt(new Date());
      reset({ gracePeriodMinutes: updated?.gracePeriodMinutes ?? values.gracePeriodMinutes });
      onSaved?.(updated);
    } catch (error) {
      setServerError(
        error?.response?.data?.message || "Unable to update the grace period. Please try again."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <SettingsCard
        title="Grace Period"
        description="Minutes after office start time an employee can still clock in as present."
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

        <div className="sm:w-52">
          <Input
            type="number"
            min={0}
            max={120}
            label="Grace period (minutes)"
            disabled={!canEdit}
            error={errors.gracePeriodMinutes?.message}
            helperText={!errors.gracePeriodMinutes ? "Between 0 and 120 minutes" : undefined}
            {...register("gracePeriodMinutes", {
              required: "Grace period is required",
              min: { value: 0, message: "Must be at least 0 minutes" },
              max: { value: 120, message: "Must be at most 120 minutes" },
            })}
          />
        </div>
      </SettingsCard>
    </form>
  );
};

export default GracePeriodForm;
