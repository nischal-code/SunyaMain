import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Card from "../common/Card";
import Loader from "../common/Loader";
import Button from "../common/Button";
import * as notificationApi from "../../api/notification.api";

const CHANNEL_FIELDS = [
  { key: "email", label: "Email", description: "Receive notifications by email." },
  { key: "push", label: "Push", description: "Browser and device push notifications." },
  { key: "inApp", label: "In-app", description: "Show notifications in the notification bell." },
];

const TYPE_FIELDS = [
  { key: "taskAssigned", label: "Task assigned", description: "A task is assigned to you." },
  {
    key: "taskDue",
    label: "Task due soon",
    description: "A task you own is approaching its due date.",
  },
  {
    key: "taskCompleted",
    label: "Task completed",
    description: "A task you assigned has been marked complete.",
  },
  {
    key: "projectUpdates",
    label: "Project updates",
    description: "Changes to projects you're a member of.",
  },
  {
    key: "attendance",
    label: "Attendance",
    description: "Clock-in reminders and attendance summaries.",
  },
  { key: "announcements", label: "Announcements", description: "Company-wide announcements." },
];

const DEFAULT_VALUES = {
  channels: { email: true, push: true, inApp: true },
  types: {
    taskAssigned: true,
    taskDue: true,
    taskCompleted: true,
    projectUpdates: true,
    attendance: true,
    announcements: true,
  },
};

/**
 * Switch
 * Small local toggle control (no shared Switch/Toggle component exists
 * in common/ yet). Presentational only — value/onChange are controlled
 * by the parent form.
 */
const Switch = ({ id, checked, onChange }) => (
  <button
    type="button"
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 ${
      checked ? "bg-primary-600" : "bg-gray-200"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

/**
 * NotificationSettingsForm
 * Lets the authenticated user manage which channels and notification
 * types they receive. Backed by GET/PATCH /notifications/settings.
 */
const NotificationSettingsForm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    let isMounted = true;

    notificationApi
      .getNotificationSettings()
      .then((res) => {
        if (!isMounted) return;
        const settings = res?.data?.data;
        reset({
          channels: { ...DEFAULT_VALUES.channels, ...settings?.channels },
          types: { ...DEFAULT_VALUES.types, ...settings?.types },
        });
      })
      .catch((err) => {
        if (isMounted) {
          setLoadError(err?.response?.data?.message || "Unable to load notification settings");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [reset]);

  const values = watch();

  const onSubmit = async (formValues) => {
    setServerError("");
    setSuccessMessage("");
    try {
      await notificationApi.updateNotificationSettings(formValues);
      setSuccessMessage("Notification preferences saved.");
      reset(formValues);
    } catch (error) {
      setServerError(
        error?.response?.data?.message || "Unable to save notification preferences. Please try again."
      );
    }
  };

  if (isLoading) {
    return (
      <Card title="Notification preferences">
        <Loader text="Loading preferences…" />
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card title="Notification preferences">
        <p className="py-6 text-center text-sm text-red-600">{loadError}</p>
      </Card>
    );
  }

  return (
    <Card
      title="Notification preferences"
      subtitle="Choose how and when you'd like to be notified."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {serverError}
          </div>
        )}
        {successMessage && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <section>
          <h4 className="mb-3 text-sm font-semibold text-gray-900">Channels</h4>
          <div className="space-y-4">
            {CHANNEL_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center justify-between gap-4">
                <div>
                  <label
                    htmlFor={`channels.${field.key}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    {field.label}
                  </label>
                  <p className="text-xs text-gray-400">{field.description}</p>
                </div>
                <Switch
                  id={`channels.${field.key}`}
                  checked={Boolean(values.channels?.[field.key])}
                  onChange={(checked) =>
                    setValue(`channels.${field.key}`, checked, { shouldDirty: true })
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h4 className="mb-3 text-sm font-semibold text-gray-900">Notify me about</h4>
          <div className="space-y-4">
            {TYPE_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center justify-between gap-4">
                <div>
                  <label
                    htmlFor={`types.${field.key}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    {field.label}
                  </label>
                  <p className="text-xs text-gray-400">{field.description}</p>
                </div>
                <Switch
                  id={`types.${field.key}`}
                  checked={Boolean(values.types?.[field.key])}
                  onChange={(checked) =>
                    setValue(`types.${field.key}`, checked, { shouldDirty: true })
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end border-t border-gray-100 pt-5">
          <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default NotificationSettingsForm;
