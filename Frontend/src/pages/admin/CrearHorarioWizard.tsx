import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getCentroActivo } from "../../utils/auth";
import "../../styles/admin/adminHorariosBuilder.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Opcion {
  id: number;
  nivel: string | null;
  cursoBase: string | null;
  ramaId: number | null;
  rama: string | null;
  grupo: string | null;
}

function CrearHorarioWizard() {
  const navigate = useNavigate();
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [nivel, setNivel] = useState("");
  const [cursoBase, setCursoBase] = useState("");
  const [ramaId, setRamaId] = useState("");
  const [grupo, setGrupo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      const res = await fetch(
        `${API_URL}/api/admin/horarios/opciones-contexto?centroId=${centroActivo.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) setOpciones(data);
    };
    cargar();
  }, []);

  const niveles = Array.from(
    new Set(opciones.filter((o) => o.nivel).map((o) => o.nivel)),
  ) as string[];
  const cursosDelNivel = Array.from(
    new Set(opciones.filter((o) => o.nivel === nivel).map((o) => o.cursoBase)),
  ) as string[];
  const ramasDelCurso = opciones.filter(
    (o) => o.nivel === nivel && o.cursoBase === cursoBase && o.ramaId,
  );
  const gruposDisponibles = opciones.filter(
    (o) =>
      o.nivel === nivel &&
      o.cursoBase === cursoBase &&
      (ramaId ? o.ramaId === Number(ramaId) : true),
  );

  const handleSiguiente = () => {
    const opcion = gruposDisponibles.find((o) =>
      grupo ? o.grupo === grupo : true,
    );
    if (!opcion) {
      setError("Selecciona una combinacion valida");
      return;
    }
    navigate(`/admin/horarios/${opcion.id}`);
  };

  return (
    <div className="content crear-curso-page">
      <div className="detalle-asig-breadcrumb">
        <span onClick={() => navigate("/admin/horarios")}>Horarios</span>
        <ChevronRight size={12} /> <strong>Crear horario</strong>
      </div>
      <h1>Crear horario</h1>
      <p className="subtitle">Paso 1 de 2: Selecciona el contexto</p>

      <div className="wizard-pasos">
        <span className="wizard-paso activo">1 Contexto</span>
        <span className="wizard-paso">2 Horario</span>
      </div>

      <div className="crear-curso-card">
        <h3>Selecciona el curso y grupo</h3>

        <label className="modal-label">Nivel educativo *</label>
        <select
          className="modal-select"
          value={nivel}
          onChange={(e) => {
            setNivel(e.target.value);
            setCursoBase("");
            setRamaId("");
            setGrupo("");
          }}
        >
          <option value="">Selecciona un nivel</option>
          {niveles.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <label className="modal-label">Curso *</label>
        <select
          className="modal-select"
          value={cursoBase}
          onChange={(e) => {
            setCursoBase(e.target.value);
            setRamaId("");
            setGrupo("");
          }}
          disabled={!nivel}
        >
          <option value="">Selecciona un curso</option>
          {cursosDelNivel.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {ramasDelCurso.length > 0 && (
          <>
            <label className="modal-label">Rama *</label>
            <select
              className="modal-select"
              value={ramaId}
              onChange={(e) => {
                setRamaId(e.target.value);
                setGrupo("");
              }}
            >
              <option value="">Selecciona una rama</option>
              {Array.from(
                new Map(ramasDelCurso.map((o) => [o.ramaId, o.rama])).entries(),
              ).map(([id, nombre]) => (
                <option key={id} value={id ?? ""}>
                  {nombre}
                </option>
              ))}
            </select>
          </>
        )}

        {gruposDisponibles.some((o) => o.grupo) && (
          <>
            <label className="modal-label">Grupo *</label>
            <select
              className="modal-select"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
            >
              <option value="">Selecciona un grupo</option>
              {Array.from(
                new Set(
                  gruposDisponibles.filter((o) => o.grupo).map((o) => o.grupo),
                ),
              ).map((g) => (
                <option key={g} value={g ?? ""}>
                  Grupo {g}
                </option>
              ))}
            </select>
          </>
        )}

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-botones">
          <button
            className="btn-guardar-verde"
            onClick={handleSiguiente}
            disabled={!cursoBase}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}

export default CrearHorarioWizard;
