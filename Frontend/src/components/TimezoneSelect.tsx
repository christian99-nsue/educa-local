import { useMemo } from "react";
import { obtenerZonasHorarias } from "../utils/timezones";

interface TimezoneSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

const TimezoneSelect = ({
  id = "ZonaHoraria",
  value,
  onChange,
  label = "Zona horaria",
  error,
}: TimezoneSelectProps) => {
  const zonasHorarias = useMemo(() => obtenerZonasHorarias(), []);

  return (
    <div className="form-group">
      <div className="label-row">
        <label htmlFor={id}>{label}</label>
        {error && <span className="lg-error">{error || "\u00A0"}</span>}
      </div>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {zonasHorarias.map((zona) => (
          <option key={zona.value} value={zona.value}>
            {zona.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimezoneSelect;
