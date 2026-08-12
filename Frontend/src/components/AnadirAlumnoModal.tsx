import { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import { getCentroActivo } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

interface CursoOpcion {
  cursoId: number;
  ramaId: number | null;
  etiqueta: string;
}

export interface AlumnoCreado {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  codigo: string;
  curso: string;
  password: string | null;
  esNuevo: boolean;
}

interface UsuarioEncontrado {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  codigo: string | null;
}

interface AnadirAlumnoModalProps {
  onClose: () => void;
  onCreado: (alumno: AlumnoCreado) => void;
}

function AnadirAlumnoModal({ onClose, onCreado }: AnadirAlumnoModalProps) {
  const [modo, setModo] = useState<"buscar" | "nuevo" | "existente">("buscar");
  const [email, setEmail] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [usuarioEncontrado, setUsuarioEncontrado] =
    useState<UsuarioEncontrado | null>(null);
  const [yaPertenece, setYaPertenece] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [cursoOpciones, setCursoOpciones] = useState<CursoOpcion[]>([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarCursos = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      const res = await fetch(
        `${API_URL}/api/admin/alumnos/anadir/cursos?centroId=${centroActivo.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) setCursoOpciones(data);
    };
    cargarCursos();
  }, []);

  const handleBuscar = async () => {
    if (!email) return;
    setBuscando(true);
    setError("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    try {
      const res = await fetch(
        `${API_URL}/api/admin/alumnos/anadir/buscar?centroId=${centroActivo.id}&email=${encodeURIComponent(email)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al buscar");

      if (data.existe) {
        setUsuarioEncontrado(data.usuario);
        setYaPertenece(data.yaPerteneceAlCentro);
        setModo("existente");
      } else {
        setUsuarioEncontrado(null);
        setModo("nuevo");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar");
    } finally {
      setBuscando(false);
    }
  };

  const parseCursoValue = (value: string) => {
    const [cursoId, ramaId] = value.split("-");
    return {
      cursoId: Number(cursoId),
      ramaId: ramaId === "null" ? null : Number(ramaId),
    };
  };

  const handleCrearNuevo = async () => {
    if (!nombre || !cursoSeleccionado) {
      setError("Completa el nombre y el curso");
      return;
    }
    setGuardando(true);
    setError("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const { cursoId, ramaId } = parseCursoValue(cursoSeleccionado);

    try {
      const res = await fetch(`${API_URL}/api/admin/alumnos/anadir/nuevo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          centroId: centroActivo.id,
          nombre,
          apellidos,
          email,
          cursoId,
          ramaId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al crear el alumno");
      onCreado(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el alumno");
    } finally {
      setGuardando(false);
    }
  };

  const handleAnadirExistente = async () => {
    if (!cursoSeleccionado) {
      setError("Selecciona un curso");
      return;
    }
    setGuardando(true);
    setError("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const { cursoId, ramaId } = parseCursoValue(cursoSeleccionado);

    try {
      const res = await fetch(`${API_URL}/api/admin/alumnos/anadir/existente`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          centroId: centroActivo.id,
          alumnoId: usuarioEncontrado?.id,
          cursoId,
          ramaId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al añadir el alumno");
      onCreado(data);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al añadir el alumno",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <h2>Añadir alumno</h2>
        <p className="modal-subtitle">
          Busca por correo para saber si el alumno ya tiene cuenta en la
          plataforma.
        </p>

        <label className="modal-label">Correo electronico del alumno</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="modal-input"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setModo("buscar");
              setUsuarioEncontrado(null);
            }}
            placeholder="alumno@correo.com"
          />
          <button
            className="modal-btn-crear"
            onClick={handleBuscar}
            disabled={buscando}
          >
            <Search size={14} />
          </button>
        </div>

        {modo === "existente" && usuarioEncontrado && (
          <div
            className="modal-aviso-entregas"
            style={{ background: "#dbeafe", color: "#1e40af" }}
          >
            Ya existe una cuenta:{" "}
            <strong>
              {usuarioEncontrado.nombre} {usuarioEncontrado.apellidos}
            </strong>{" "}
            ({usuarioEncontrado.codigo}).
            {yaPertenece
              ? " Este alumno ya pertenece a este centro."
              : " Se añadira a este centro con el curso que selecciones."}
          </div>
        )}

        {modo === "nuevo" && (
          <>
            <div
              className="modal-aviso-entregas"
              style={{ background: "#dcfce7", color: "#166534" }}
            >
              No existe una cuenta con este correo. Se creara una cuenta nueva.
            </div>
            <label className="modal-label">Nombre</label>
            <input
              className="modal-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <label className="modal-label">Apellidos</label>
            <input
              className="modal-input"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
            />
          </>
        )}

        {(modo === "nuevo" || (modo === "existente" && !yaPertenece)) && (
          <>
            <label className="modal-label">Curso</label>
            <select
              className="modal-select"
              value={cursoSeleccionado}
              onChange={(e) => setCursoSeleccionado(e.target.value)}
            >
              <option value="">Selecciona un curso</option>
              {cursoOpciones.map((c) => (
                <option
                  key={`${c.cursoId}-${c.ramaId ?? "null"}`}
                  value={`${c.cursoId}-${c.ramaId ?? "null"}`}
                >
                  {c.etiqueta}
                </option>
              ))}
            </select>
          </>
        )}

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-botones">
          <button className="modal-btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          {modo === "nuevo" && (
            <button
              className="modal-btn-crear"
              onClick={handleCrearNuevo}
              disabled={guardando}
            >
              {guardando ? "Creando..." : "Crear alumno"}
            </button>
          )}
          {modo === "existente" && !yaPertenece && (
            <button
              className="modal-btn-crear"
              onClick={handleAnadirExistente}
              disabled={guardando}
            >
              {guardando ? "Añadiendo..." : "Añadir al centro"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnadirAlumnoModal;
