import { useEffect, useMemo, useRef, useState } from "react";
import * as Flags from "country-flag-icons/react/3x2";
import { obtenerPaises } from "../utils/countries";
import type { Pais } from "../utils/countries";

interface CountrySelectProps {
  id?: string;
  value: string; // codigoIso, ej: "GQ"
  onChange: (pais: Pais) => void;
  label?: string;
  error?: string;
}

//FUncion para seleccionar el pais

const CountrySelect = ({
  id = "Pais",
  value,
  onChange,
  label = "País",
  error,
}: CountrySelectProps) => {
  const paises = useMemo(() => obtenerPaises(), []);
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const contenedorRef = useRef<HTMLDivElement>(null);

  const paisSeleccionado = paises.find((p) => p.codigoIso === value);

  const paisesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return paises;
    const texto = busqueda.toLowerCase();
    return paises.filter((p) => p.nombre.toLowerCase().includes(texto));
  }, [busqueda, paises]);

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target as Node)
      ) {
        setAbierto(false);
        setBusqueda("");
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const handleSeleccionar = (pais: Pais) => {
    onChange(pais);
    setAbierto(false);
    setBusqueda("");
  };

  const BanderaSeleccionada = paisSeleccionado
    ? Flags[paisSeleccionado.codigoIso as keyof typeof Flags]
    : null;

  return (
    <div className="form-group" ref={contenedorRef}>
      <div className="label-row">
        <label htmlFor={id}>{label}</label>
        {error && <span className="lg-error">{error || "\u00A0"}</span>}
      </div>

      <div className="country-select-box">
        <button
          type="button"
          id={id}
          className="country-select-trigger"
          onClick={() => setAbierto((prev) => !prev)}
        >
          <span className="country-select-value">
            {BanderaSeleccionada && (
              <BanderaSeleccionada
                title={paisSeleccionado?.nombre}
                className="country-flag-icon"
              />
            )}
            {paisSeleccionado
              ? paisSeleccionado.nombre
              : "-- Selecciona un país --"}
          </span>
          <span className={`country-select-arrow ${abierto ? "abierto" : ""}`}>
            ▾
          </span>
        </button>

        {abierto && (
          <div className="country-select-dropdown">
            <input
              type="text"
              className="country-select-search"
              placeholder="Buscar país..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoFocus
            />
            <ul className="country-select-list">
              {paisesFiltrados.length === 0 && (
                <li className="country-select-empty">Sin resultados</li>
              )}
              {paisesFiltrados.map((pais) => {
                const Bandera = Flags[pais.codigoIso as keyof typeof Flags];
                return (
                  <li key={pais.codigoIso}>
                    <button
                      type="button"
                      className="country-select-option"
                      onClick={() => handleSeleccionar(pais)}
                    >
                      {Bandera && <Bandera className="country-flag-icon" />}
                      {pais.nombre}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountrySelect;
