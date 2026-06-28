import { useState } from "react";
import "../../styles/SelectCenter.css";

interface Centro {
  id: number;
  nombre: string;
  rol: string;
  logo?: string;
  rol_en_centro?: string;
}

interface SelectCenterProps {
  centros: Centro[];
  userName?: string;
  onSelect: (centro: Centro) => void;
}

const rolLabel: Record<string, string> = {
  admin: "Administrador",
  teacher: "Profesor",
  student: "Estudiante",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const ACCENT_COLORS = [
  "#4F6CF7",
  "#7C3AED",
  "#059669",
  "#D97706",
  "#DC2626",
  "#0891B2",
];

export default function SelectCenter({
  centros,
  userName,
  onSelect,
}: SelectCenterProps) {
  console.log("SelectCenter montado, centros:", centros);
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (centro: Centro) => {
    setSelected(centro.id);
    setTimeout(() => {
      onSelect(centro);
    }, 200);
  };

  return (
    <div className="sc-root">
      <div className="sc-container">
        {/* Header */}
        <div className="sc-header">
          <div className="sc-logo-mark" />
          <h1 className="sc-title">
            {userName ? `Hola, ${userName}` : "Bienvenido"}
          </h1>
          <p className="sc-subtitle">
            Selecciona el centro en el que deseas iniciar sesion.
          </p>
        </div>
        {/*Grid*/}
        <div
          className="sc-grid"
          style={{
            gridTemplateColumns:
              centros.length === 1
                ? "minmax(260px, 400px)"
                : centros.length === 2
                  ? "repeat(2, 1fr)"
                  : centros.length <= 4
                    ? "repeat(2, 1fr)"
                    : "repeat(3, 1fr)",
          }}
        >
          {centros.map((centro, i) => {
            const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
            const isSelected = selected === centro.id;

            return (
              <button
                key={centro.id}
                className={`sc-card ${isSelected ? "sc-card--selected" : ""}`}
                onClick={() => handleSelect(centro)}
                style={{ "--accent": accent } as React.CSSProperties}
              >
                <div className="sc-card-accent" />
                {/* Logo o iniciales */}
                <div className="sc-avatar" style={{ background: accent }}>
                  {centro.logo ? (
                    <img
                      src={centro.logo}
                      alt={centro.nombre}
                      className="sc-avatar-img"
                    />
                  ) : (
                    <span className="sc-avatar-initials">
                      {getInitials(centro.nombre)}
                    </span>
                  )}
                </div>

                <div className="sc-card-body">
                  <p className="sc-center-name">{centro.nombre}</p>
                  <span className="sc-role-badge" style={{ color: accent }}>
                    {rolLabel[centro.rol] ?? centro.rol}
                  </span>
                </div>
                <div
                  className={`sc-check ${isSelected ? "sc-check--visible" : ""}`}
                >
                  <svg viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill={accent} />
                    <path
                      d="M6 10.5l3 3 5-5"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

        {/*Footer*/}
        <button
          className="sc-logout"
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/";
          }}
        >
          Cerrar sesion
        </button>
      </div>
    </div>
  );
}
