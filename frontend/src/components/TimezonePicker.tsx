import TimezoneSelect, { ITimezone } from "react-timezone-select";

type Props = {
  value: string;
  onChange: (tz: string) => void;
};

export function TimezonePicker({ value, onChange }: Props) {
  // TimezoneSelect wants an object, but you can just pass the string as value, and .value will always be the canonical tz string.
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Timezone *</label>
      <TimezoneSelect
        value={value}
        onChange={(tz) => onChange(typeof tz === "string" ? tz : tz.value)}
        styles={{
          control: base => ({ ...base, minHeight: 40 }),
          menu: base => ({ ...base, zIndex: 50 }) // makes sure menu is above modals
        }}
      />
    </div>
  );
}
