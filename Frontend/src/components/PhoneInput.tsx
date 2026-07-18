interface PhoneInputProps {
  id?: string;
  codigoTelefono: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

//Funcion para mostrar el input del movil con prefijo del pais

const PhoneInput = ({
  id = "Telefono",
  codigoTelefono,
  value,
  onChange,
  label = "Teléfono",
  error,
}: PhoneInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const soloNumeros = e.target.value.replace(/\D/g, ""); // elimina todo lo que no sea dígito
    onChange(soloNumeros);
  };

  return (
    <div className="form-group">
      <div className="label-row">
        <label htmlFor={id}>{label}</label>
        {error && <span className="lg-error">{error || "\u00A0"}</span>}
      </div>
      <div className="phone-input-box">
        <span className="phone-prefix">{codigoTelefono || "+..."}</span>
        <input
          type="tel"
          id={id}
          placeholder="222123456"
          value={value}
          onChange={handleChange}
          inputMode="numeric"
          maxLength={15}
        />
      </div>
    </div>
  );
};

export default PhoneInput;
