import { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import { getCentroActivo } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

interface AsignaturaOpcion {
  cursoAsignaturaId: number;
  etiqueta: string;
}

export interface ProfesorCreado {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  codigo: string;
  asignaturas: string;
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

interface AnadirProfesorModalProps {
  onClose: () => void;
  onCreado: (profesor: ProfesorCreado) => void;
}

function AnadirProfesorModal({ onClose, onCreado }: AnadirProfesorModalProps) {
  const [modo, setModo] = useState<"buscar" | "nuevo" | "existente">("buscar");
  const [email, setEmail] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [usuarioEncontrado, setUsuarioEncontrado] =
    useState<UsuarioEncontrado | null>(null);
  const [yaPertenece, setYaPertenece] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [asignaturaOpciones, setAsignaturaOpciones] = useState<
    AsignaturaOpcion[]
  >([]);
  const [asignaturasSeleccionadas, setAsignaturasSeleccionadas] = useState<
    number[]
  >([]);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarAsignaturas = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      const res = await fetch(
        `${API_URL}/api/admin/profesores/anadir/asignaturas?centroId=${centroActivo.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) setAsignaturaOpciones(data);
    };
    cargarAsignaturas();
  }, []);

  const handleBuscar = async () => {
    if (!email) return;
    setBuscando(true);
    setError("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    try {
      const res = await fetch(
        `${API_URL}/api/admin/profesores/anadir/buscar?centroId=${centroActivo.id}&email=${encodeURIComponent(email)}`,
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

  const toggleAsignatura = (id: number) => {
    setAsignaturasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCrearNuevo = async () => {
    if (!nombre || asignaturasSeleccionadas.length === 0) {
      setError("Completa el nombre y selecciona al menos una asignatura");
      return;
    }
    setGuardando(true);
    setError("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    try {
      const res = await fetch(`${API_URL}/api/admin/profesores/anadir/nuevo`, {
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
          cursoAsignaturaIds: asignaturasSeleccionadas,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al crear el profesor");
      onCreado(data);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear el profesor",
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleAnadirExistente = async () => {
    if (asignaturasSeleccionadas.length === 0) {
      setError("Selecciona al menos una asignatura");
      return;
    }
    setGuardando(true);
    setError("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    try {
      const res = await fetch(
        `${API_URL}/api/admin/profesores/anadir/existente`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            centroId: centroActivo.id,
            profesorId: usuarioEncontrado?.id,
            cursoAsignaturaIds: asignaturasSeleccionadas,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Error al añadir el profesor");
      onCreado(data);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al añadir el profesor",
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
        <h2>Añadir profesor</h2>
        <p className="modal-subtitle">
          Busca por correo para saber si el profesor ya tiene cuenta en la
          plataforma.
        </p>

        <label className="modal-label">Correo electronico del profesor</label>
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
            placeholder="profesor@correo.com"
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
              ? " Este profesor ya pertenece a este centro."
              : " Se añadira a este centro con las asignaturas que selecciones."}
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
            <label className="modal-label">Asignaturas que impartira</label>
            <div className="modal-checkbox-lista">
              {asignaturaOpciones.map((op) => (
                <label
                  key={op.cursoAsignaturaId}
                  className="modal-checkbox-item"
                >
                  <input
                    type="checkbox"
                    checked={asignaturasSeleccionadas.includes(
                      op.cursoAsignaturaId,
                    )}
                    onChange={() => toggleAsignatura(op.cursoAsignaturaId)}
                  />
                  {op.etiqueta}
                </label>
              ))}
            </div>
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
              {guardando ? "Creando..." : "Crear profesor"}
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

export default AnadirProfesorModal;
