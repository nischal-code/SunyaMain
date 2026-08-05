import Card from "../common/Card";

/**
 * SettingsCard
 * Thin wrapper around the generic Card for the office-settings screen —
 * every settings section (office timing, grace period, min working hours)
 * shares the same title/description/footer layout, so each form component
 * just supplies its fields as children plus a save button in `footer`.
 *
 * Props:
 *  - title:       string — section heading, e.g. "Office Timing"
 *  - description: string — one-line explanation of what the section controls
 *  - footer:      node — typically the section's save Button (+ status text)
 *  - className:   string — extra classes on the outer Card
 */
const SettingsCard = ({ title, description, footer, className = "", children }) => {
  return (
    <Card title={title} subtitle={description} footer={footer} className={className}>
      <div className="space-y-4">{children}</div>
    </Card>
  );
};

export default SettingsCard;
