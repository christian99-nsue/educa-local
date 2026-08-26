import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  Calendar,
  List,
  Trash2,
  Pencil,
  Plus,
} from "lucide-react";
import { getCentroActivo } from "../../utils/auth";
import ClaseModal from "../../components/ClaseModal";
import ConfirmarEliminarModal from "../../components/ConfirmarEliminarModal";
import "../../styles/admin/adminHorariosBuilder.css";

const API_URL = import.meta.env.VITE_API_URL;

interface AsignaturaOpcion {
  cursoAsignaturaId: number;
  asignatura: string;
  profesor: string | null;
}

interface Clase {
  id: number;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  asignatura: string;
  cursoAsignaturaId: number;
  profesor: string;
}

interface Descanso {
  id: number;
  nombre: string;
  horaInicio: string;
  horaFin: string;
}

const DIAS = [
  { num: 1, nombre: "Lunes" },
  { num: 2, nombre: "Martes" },
  { num: 3, nombre: "Miercoles" },
  { num: 4, nombre: "Jueves" },
  { num: 5, nombre: "Viernes" },
];

const colores = [
  { bg: "#f0d5fc", borde: "#B032E7", texto: "Matematicas" },
  { bg: "#c5def8", borde: "#59ADFF", texto: "Literatura" },
  { bg: "#ffe3e4", borde: "#FC4850", texto: "Ingles" },
  { bg: "#e7fdb8", borde: "#5f8408", texto: "Geologia" },
  { bg: "#ffeba1", borde: "#F8C822", texto: "Ciencias Naturales" },
  { bg: "#e6e6e6", borde: "#686868", texto: "Frances" },
  { bg: "#ddffd8", borde: "#18B300", texto: "Economia" },
  { bg: "#ffc9c9", borde: "#ff0000", texto: "Filosofia" },
];

function EditorHorarioAdmin() {
  const { centroCursoId } = useParams();
  const navigate = useNavigate();

  const [etiqueta, setEtiqueta] = useState("");
  const [asignaturas, setAsignaturas] = useState<AsignaturaOpcion[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [descansos, setDescansos] = useState<Descanso[]>([]);
  const [vista, setVista] = useState<"semana" | "lista">("semana");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalAbierto, setModalAbierto] = useState<{
    dia: number;
    horaInicio?: string;
    horaFin?: string;
    clase?: Clase;
  } | null>(null);
  const [eliminarHorario, setEliminarHorario] = useState(false);
  const [modalDescansoAbierto, setModalDescansoAbierto] = useState(false);
  const [nombreDescanso, setNombreDescanso] = useState("Recreo");
  const [horaInicioDescansoH, setHoraInicioDescansoH] = useState("12");
  const [horaInicioDescansoM, setHoraInicioDescansoM] = useState("00");
  const [horaFinDescansoH, setHoraFinDescansoH] = useState("12");
  const [horaFinDescansoM, setHoraFinDescansoM] = useState("20");

  const handleCrearDescanso = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const res = await fetch(`${API_URL}/api/admin/horarios/descansos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        centroId: centroActivo.id,
        nombre: nombreDescanso,
        horaInicio: `${horaInicioDescansoH}:${horaInicioDescansoM}`,
        horaFin: `${horaFinDescansoH}:${horaFinDescansoM}`,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al crear el descanso");
    setModalDescansoAbierto(false);
    cargar();
  };

  const cargar = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    try {
      const res = await fetch(
        `${API_URL}/api/admin/horarios/contexto/${centroCursoId}?centroId=${centroActivo.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al cargar el horario");
      setEtiqueta(data.etiqueta);
      setAsignaturas(data.asignaturas ?? []);
      setClases(data.clases ?? []);
      setDescansos(data.descansos ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar el horario",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centroCursoId]);

  const HORAS_BASE = ["08:00"];
  const franjasHorarias = Array.from(
    new Set([
      ...clases.map((c) => c.horaInicio),
      ...descansos.map((d) => d.horaInicio),
      ...HORAS_BASE,
    ]),
  ).sort();

  const descansoEnHora = (horaInicio: string) =>
    descansos.find((d) => d.horaInicio === horaInicio);
  const claseEnDiaYHora = (dia: number, horaInicio: string) =>
    clases.find((c) => c.diaSemana === dia && c.horaInicio === horaInicio);

  const colorPorAsignatura = (nombre: string) => {
    let hash = 0;
    for (let i = 0; i < nombre.length; i++)
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    return colores[Math.abs(hash) % colores.length];
  };

  const handleGuardarClase = async (datos: {
    cursoAsignaturaId: number;
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
  }) => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    if (modalAbierto?.clase) {
      const res = await fetch(
        `${API_URL}/api/admin/horarios/clase/${modalAbierto.clase.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ centroId: centroActivo.id, ...datos }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al guardar");
    } else {
      const res = await fetch(`${API_URL}/api/admin/horarios/clase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ centroId: centroActivo.id, ...datos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al guardar");
    }
    cargar();
  };

  const handleEliminarClase = async () => {
    if (!modalAbierto?.clase) return;
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const res = await fetch(
      `${API_URL}/api/admin/horarios/clase/${modalAbierto.clase.id}?centroId=${centroActivo.id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al eliminar");
    cargar();
  };

  const handleEliminarHorarioCompleto = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const res = await fetch(
      `${API_URL}/api/admin/horarios/contexto/${centroCursoId}?centroId=${centroActivo.id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al eliminar");
    navigate("/admin/horarios");
  };

  if (loading) return <p>Cargando horario...</p>;
  if (error) {
    return (
      <div className="content">
        <p>{error}</p>
      </div>
    );
  }

  const diasConClases = Array.from(
    new Set(clases.map((c) => c.diaSemana)),
  ).sort();

  return (
    <div className="content editor-horario-page">
      <div className="detalle-asig-breadcrumb">
        <span onClick={() => navigate("/admin/horarios")}>Horarios</span>
        <ChevronRight size={12} />{" "}
        <strong>{etiqueta || "Horario sin etiqueta"}</strong>
      </div>
      <h1>{clases.length === 0 ? "Crear horario" : "Editar horario"}</h1>
      {clases.length === 0 && (
        <p className="subtitle">Paso 2 de 2: Añade las clases</p>
      )}

      <div className="editor-horario-toolbar">
        <div className="editor-horario-contexto">
          <Calendar size={14} /> <strong>{etiqueta}</strong>
        </div>
        <div className="horario-toggle-vista">
          <button
            className={vista === "semana" ? "activo" : ""}
            onClick={() => setVista("semana")}
          >
            <Calendar size={14} /> Vista semanal
          </button>
          <button
            className={vista === "lista" ? "activo" : ""}
            onClick={() => setVista("lista")}
          >
            <List size={14} /> Lista de clases
          </button>
        </div>
        <button
          className="admin-accion-btn eliminar"
          style={{ width: "auto", padding: "0 14px" }}
          onClick={() => setEliminarHorario(true)}
        >
          <Trash2 size={14} /> Eliminar horario
        </button>
        <button
          className="btn-guardar-verde"
          onClick={() => setModalDescansoAbierto(true)}
        >
          <Plus size={14} /> Añadir descanso
        </button>
      </div>

      {vista === "semana" ? (
        <div className="admin-horario-tabla-card">
          <table className="admin-horario-tabla">
            <thead>
              <tr>
                <th className="col-hora">Hora</th>
                {DIAS.map((d) => (
                  <th key={d.num}>{d.nombre}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {franjasHorarias.map((horaInicio) => {
                const descanso = descansoEnHora(horaInicio);
                if (descanso) {
                  return (
                    <tr key={horaInicio}>
                      <td className="col-hora">
                        {descanso.horaInicio.slice(0, 5)} -{" "}
                        {descanso.horaFin.slice(0, 5)}
                      </td>
                      <td
                        colSpan={DIAS.length}
                        className="horario-descanso-celda"
                      >
                        <div className="horario-descanso-bloque">
                          {descanso.nombre.toUpperCase()}
                        </div>
                      </td>
                    </tr>
                  );
                }
                const claseFin = clases.find(
                  (c) => c.horaInicio === horaInicio,
                );
                const horaFinDefault = claseFin?.horaFin ?? "";
                return (
                  <tr key={horaInicio}>
                    <td className="col-hora">
                      {horaInicio.slice(0, 5)}
                      {horaFinDefault && ` - ${horaFinDefault.slice(0, 5)}`}
                    </td>
                    {DIAS.map((d) => {
                      const clase = claseEnDiaYHora(d.num, horaInicio);
                      if (!clase) {
                        return (
                          <td key={d.num}>
                            <button
                              className="editor-horario-celda-vacia"
                              onClick={() =>
                                setModalAbierto({
                                  dia: d.num,
                                  horaInicio,
                                  horaFin: horaFinDefault || undefined,
                                })
                              }
                            >
                              <Plus size={14} />
                            </button>
                          </td>
                        );
                      }
                      const color = colorPorAsignatura(clase.asignatura);
                      return (
                        <td key={d.num}>
                          <div
                            className="admin-horario-bloque"
                            style={{
                              background: color.bg,
                              borderLeft: `3px solid ${color.borde}`,
                            }}
                            onClick={() =>
                              setModalAbierto({ dia: d.num, clase })
                            }
                          >
                            <div className="admin-horario-bloque-header">
                              <strong>{clase.asignatura}</strong>
                              <Pencil size={11} />
                            </div>
                            <span>{clase.profesor}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="horario-leyenda">
            {Array.from(new Set(clases.map((c) => c.asignatura))).map(
              (asig) => {
                const color = colorPorAsignatura(asig);
                return (
                  <span key={asig} className="horario-leyenda-item">
                    <span
                      className="horario-leyenda-punto"
                      style={{ background: color.borde }}
                    />{" "}
                    {asig}
                  </span>
                );
              },
            )}
          </div>
        </div>
      ) : (
        <div className="admin-horario-tabla-card" style={{ padding: 0 }}>
          {diasConClases.map((diaNum) => {
            const clasesDelDia = clases
              .filter((c) => c.diaSemana === diaNum)
              .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
            const nombreDia = DIAS.find((d) => d.num === diaNum)?.nombre;
            return (
              <div key={diaNum} className="horario-lista-dia-bloque">
                <h3>Clases del dia: {nombreDia}</h3>
                <table className="admin-alumnos-tabla">
                  <thead>
                    <tr>
                      <th>Hora</th>
                      <th>Asignatura</th>
                      <th>Profesor</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clasesDelDia.map((c) => {
                      const color = colorPorAsignatura(c.asignatura);
                      return (
                        <tr key={c.id}>
                          <td>
                            {c.horaInicio.slice(0, 5)} - {c.horaFin.slice(0, 5)}
                          </td>
                          <td>
                            <span
                              className="horario-leyenda-punto"
                              style={{
                                background: color.borde,
                                marginRight: 6,
                              }}
                            />
                            {c.asignatura}
                          </td>
                          <td>{c.profesor}</td>
                          <td>
                            <div className="admin-acciones">
                              <button
                                className="admin-accion-btn editar"
                                onClick={() =>
                                  setModalAbierto({ dia: diaNum, clase: c })
                                }
                              >
                                <Pencil size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
          {diasConClases.length === 0 && (
            <p className="material-vacio">No hay clases programadas todavia.</p>
          )}
        </div>
      )}

      {modalAbierto && (
        <ClaseModal
          asignaturas={asignaturas}
          diaInicial={modalAbierto.dia}
          diaNombre={DIAS.find((d) => d.num === modalAbierto.dia)?.nombre ?? ""}
          horaInicioInicial={
            modalAbierto.clase?.horaInicio ?? modalAbierto.horaInicio
          }
          horaFinInicial={modalAbierto.clase?.horaFin ?? modalAbierto.horaFin}
          cursoAsignaturaIdInicial={modalAbierto.clase?.cursoAsignaturaId}
          esEdicion={!!modalAbierto.clase}
          onClose={() => setModalAbierto(null)}
          onGuardar={handleGuardarClase}
          onEliminar={modalAbierto.clase ? handleEliminarClase : undefined}
        />
      )}

      {eliminarHorario && (
        <ConfirmarEliminarModal
          titulo="Eliminar horario"
          mensaje={`¿Seguro que quieres eliminar todas las clases del horario de "${etiqueta}"?`}
          onClose={() => setEliminarHorario(false)}
          onConfirmar={handleEliminarHorarioCompleto}
        />
      )}

      {modalDescansoAbierto && (
        <div
          className="modal-overlay"
          onClick={() => setModalDescansoAbierto(false)}
        >
          <div
            className="modal-content"
            style={{ width: 380 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Añadir descanso</h2>
            <label className="modal-label">Nombre</label>
            <input
              className="modal-input"
              value={nombreDescanso}
              onChange={(e) => setNombreDescanso(e.target.value)}
            />
            <label className="modal-label">Hora inicio</label>
            <div className="modal-hora-selects">
              <select
                className="modal-select"
                value={horaInicioDescansoH}
                onChange={(e) => setHoraInicioDescansoH(e.target.value)}
              >
                {Array.from({ length: 24 }, (_, i) =>
                  String(i).padStart(2, "0"),
                ).map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span>:</span>
              <select
                className="modal-select"
                value={horaInicioDescansoM}
                onChange={(e) => setHoraInicioDescansoM(e.target.value)}
              >
                {["00", "10", "15", "20", "30", "40", "45", "50"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <label className="modal-label">Hora fin</label>
            <div className="modal-hora-selects">
              <select
                className="modal-select"
                value={horaFinDescansoH}
                onChange={(e) => setHoraFinDescansoH(e.target.value)}
              >
                {Array.from({ length: 24 }, (_, i) =>
                  String(i).padStart(2, "0"),
                ).map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span>:</span>
              <select
                className="modal-select"
                value={horaFinDescansoM}
                onChange={(e) => setHoraFinDescansoM(e.target.value)}
              >
                {["00", "10", "15", "20", "30", "40", "45", "50"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-botones">
              <button
                className="modal-btn-cancelar"
                onClick={() => setModalDescansoAbierto(false)}
              >
                Cancelar
              </button>
              <button className="modal-btn-crear" onClick={handleCrearDescanso}>
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditorHorarioAdmin;
