import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  Plus,
  Trash2,
  X,
  Copy,
  Check,
  Pencil,
} from "lucide-react";
import { getCentroActivo } from "../../utils/auth";
import { getIconoAsignatura } from "../../utils/asignaturaIconos";
import "../../styles/admin/adminPerfilProfesor.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const API_URL = import.meta.env.VITE_API_URL;

interface PerfilEditable {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  codigo: string | null;
  estado: "activo" | "inactivo";
}

interface Asignacion {
  profesorAsignaturaId: number;
  asignatura: string;
  curso: string;
  rama: string | null;
  grupo: string | null;
  horarioTexto: string;
}

interface OpcionAsignacion {
  cursoAsignaturaId: number;
  asignatura: string;
  nivel: string | null;
  cursoBase: string | null;
  rama: string | null;
  grupo: string | null;
}

const estilos = [
  { bg: "#f0d5fc", color: "#B032E7" },
  { bg: "#c5def8", color: "#59ADFF" },
  { bg: "#ffe3e4", color: "#FC4850" },
  { bg: "#e7fdb8", color: "#5f8408" },
  { bg: "#ffeba1", color: "#F8C822" },
  { bg: "#e6e6e6", color: "#686868" },
  { bg: "#ddffd8", color: "#18B300" },
  { bg: "#ffc9c9", color: "#ff0000" },
];

function EditarProfesorAdmin() {
  const { profesorId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"info" | "asignaciones" | "acceso">("info");
  const [perfil, setPerfil] = useState<PerfilEditable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [opcionesAsignacion, setOpcionesAsignacion] = useState<
    OpcionAsignacion[]
  >([]);
  const [modalAsignacionAbierto, setModalAsignacionAbierto] = useState(false);
  const [asignacionEditando, setAsignacionEditando] = useState<number | null>(
    null,
  );
  const [nivelSel, setNivelSel] = useState("");
  const [cursoSel, setCursoSel] = useState("");
  const [ramaSel, setRamaSel] = useState("");
  const [grupoSel, setGrupoSel] = useState("");
  const [asignaturaSel, setAsignaturaSel] = useState("");
  const [errorAsignacion, setErrorAsignacion] = useState("");
  const [modalResetAbierto, setModalResetAbierto] = useState(false);
  const [pasoReset, setPasoReset] = useState<"confirmar" | "exito">(
    "confirmar",
  );
  const [passwordTemporal, setPasswordTemporal] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [enviandoReset, setEnviandoReset] = useState(false);

  const cargarAsignaciones = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const res = await fetch(
      `${API_URL}/api/admin/profesores/${profesorId}/asignaciones?centroId=${centroActivo.id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    if (res.ok) setAsignaciones(data);
  };

  const handleAbrirReset = () => {
    setPasoReset("confirmar");
    setPasswordTemporal("");
    setModalResetAbierto(true);
  };

  const handleGenerarYEnviar = async () => {
    setEnviandoReset(true);
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    try {
      const res = await fetch(
        `${API_URL}/api/admin/profesores/${profesorId}/restablecer-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            centroId: centroActivo.id,
            enviarPorCorreo: true,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al restablecer");
      setPasswordTemporal(data.passwordTemporal);
      setPasoReset("exito");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restablecer");
    } finally {
      setEnviandoReset(false);
    }
  };

  const handleCopiar = () => {
    navigator.clipboard.writeText(passwordTemporal);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const nivelesDisponibles = Array.from(
    new Set(opcionesAsignacion.map((o) => o.nivel).filter(Boolean)),
  ) as string[];

  const cursosDisponibles = Array.from(
    new Set(
      opcionesAsignacion
        .filter((o) => o.nivel === nivelSel)
        .map((o) => o.cursoBase)
        .filter(Boolean),
    ),
  ) as string[];

  const ramasDisponibles = Array.from(
    new Set(
      opcionesAsignacion
        .filter((o) => o.nivel === nivelSel && o.cursoBase === cursoSel)
        .map((o) => o.rama)
        .filter(Boolean),
    ),
  ) as string[];

  const gruposDisponibles = Array.from(
    new Set(
      opcionesAsignacion
        .filter(
          (o) =>
            o.nivel === nivelSel &&
            o.cursoBase === cursoSel &&
            (ramasDisponibles.length === 0 || o.rama === ramaSel),
        )
        .map((o) => o.grupo)
        .filter(Boolean),
    ),
  ) as string[];

  const asignaturasDisponibles = opcionesAsignacion.filter(
    (o) =>
      o.nivel === nivelSel &&
      o.cursoBase === cursoSel &&
      (ramasDisponibles.length === 0 || o.rama === ramaSel) &&
      (gruposDisponibles.length === 0 || o.grupo === grupoSel),
  );

  const resetFormAsignacion = () => {
    setNivelSel("");
    setCursoSel("");
    setRamaSel("");
    setGrupoSel("");
    setAsignaturaSel("");
    setErrorAsignacion("");
    setAsignacionEditando(null);
  };

  const abrirNuevaAsignacion = () => {
    resetFormAsignacion();
    setModalAsignacionAbierto(true);
  };

  const abrirEditarAsignacion = (a: Asignacion) => {
    const opcion = opcionesAsignacion.find(
      (o) =>
        o.asignatura === a.asignatura &&
        o.cursoBase === a.curso &&
        o.rama === a.rama &&
        o.grupo === a.grupo,
    );
    setNivelSel(opcion?.nivel ?? "");
    setCursoSel(a.curso ?? "");
    setRamaSel(a.rama ?? "");
    setGrupoSel(a.grupo ?? "");
    setAsignaturaSel(opcion ? String(opcion.cursoAsignaturaId) : "");
    setAsignacionEditando(a.profesorAsignaturaId);
    setErrorAsignacion("");
    setModalAsignacionAbierto(true);
  };

  useEffect(() => {
    if (tab !== "asignaciones") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar, patron estandar
    cargarAsignaciones();
    const cargarOpciones = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      const res = await fetch(
        `${API_URL}/api/admin/profesores/opciones-asignacion?centroId=${centroActivo.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) setOpcionesAsignacion(data);
    };
    cargarOpciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleGuardarAsignacion = async () => {
    if (!asignaturaSel) {
      setErrorAsignacion("Selecciona una asignatura");
      return;
    }
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    try {
      const url = asignacionEditando
        ? `${API_URL}/api/admin/profesores/asignaciones/${asignacionEditando}`
        : `${API_URL}/api/admin/profesores/${profesorId}/asignaciones`;
      const res = await fetch(url, {
        method: asignacionEditando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          centroId: centroActivo.id,
          cursoAsignaturaId: Number(asignaturaSel),
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Error al guardar la asignacion");
      setModalAsignacionAbierto(false);
      resetFormAsignacion();
      cargarAsignaciones();
    } catch (err) {
      setErrorAsignacion(
        err instanceof Error ? err.message : "Error al guardar la asignacion",
      );
    }
  };

  const handleEliminarAsignacion = async (id: number) => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    await fetch(
      `${API_URL}/api/admin/profesores/asignaciones/${id}?centroId=${centroActivo.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    cargarAsignaciones();
  };

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      try {
        const res = await fetch(
          `${API_URL}/api/admin/profesores/${profesorId}/perfil?centroId=${centroActivo.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || "Error al cargar el profesor");
        setPerfil({
          nombre: data.nombre,
          apellidos: data.apellidos,
          email: data.email,
          telefono: data.telefono,
          codigo: data.codigo,
          estado: data.estado,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar el profesor",
        );
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [profesorId]);

  const handleGuardar = async () => {
    if (!perfil) return;
    setGuardando(true);
    setError("");
    setExito("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    try {
      const res = await fetch(`${API_URL}/api/admin/profesores/${profesorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          centroId: centroActivo.id,
          nombre: perfil.nombre,
          apellidos: perfil.apellidos,
          email: perfil.email,
          telefono: perfil.telefono,
          estado: perfil.estado,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al guardar");
      setExito("Cambios guardados correctamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p>Cargando profesor...</p>;
  if (error && !perfil) {
    return (
      <div className="content">
        <p>{error}</p>
      </div>
    );
  }
  if (!perfil) return null;

  return (
    <div className="content editar-profesor-admin-page">
      <div className="detalle-asig-breadcrumb">
        <span onClick={() => navigate("/admin/profesores")}>Profesores</span>
        <ChevronRight size={12} />{" "}
        <strong>
          {perfil.nombre} {perfil.apellidos}
        </strong>
      </div>
      <h1>
        Editar profesor: {perfil.nombre} {perfil.apellidos}
      </h1>

      <div className="editar-profesor-tabs">
        <button
          className={tab === "info" ? "activo" : ""}
          onClick={() => setTab("info")}
        >
          Informacion
        </button>
        <button
          className={tab === "asignaciones" ? "activo" : ""}
          onClick={() => setTab("asignaciones")}
        >
          Asignaciones
        </button>
        <button
          className={tab === "acceso" ? "activo" : ""}
          onClick={() => setTab("acceso")}
        >
          Acceso
        </button>
      </div>

      {tab === "info" && (
        <div className="ppa-card">
          <h3>Informacion personal</h3>

          <div className="editar-profesor-grid-2">
            <div>
              <label className="modal-label">Nombre *</label>
              <input
                className="modal-input"
                value={perfil.nombre}
                onChange={(e) =>
                  setPerfil({ ...perfil, nombre: e.target.value })
                }
              />
            </div>
            <div>
              <label className="modal-label">Apellidos *</label>
              <input
                className="modal-input"
                value={perfil.apellidos}
                onChange={(e) =>
                  setPerfil({ ...perfil, apellidos: e.target.value })
                }
              />
            </div>
            <div>
              <label className="modal-label">Correo electronico *</label>
              <input
                className="modal-input"
                type="email"
                value={perfil.email}
                onChange={(e) =>
                  setPerfil({ ...perfil, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="modal-label">Telefono</label>
              <input
                className="modal-input"
                value={perfil.telefono ?? ""}
                onChange={(e) =>
                  setPerfil({ ...perfil, telefono: e.target.value })
                }
              />
            </div>
            <div>
              <label className="modal-label">Codigo de profesor *</label>
              <input
                className="modal-input"
                value={perfil.codigo ?? ""}
                disabled
              />
            </div>
            <div>
              <label className="modal-label">Estado *</label>
              <select
                className="modal-select"
                value={perfil.estado}
                onChange={(e) =>
                  setPerfil({
                    ...perfil,
                    estado: e.target.value as "activo" | "inactivo",
                  })
                }
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {error && <p className="perfil-error">{error}</p>}
          {exito && <p className="perfil-exito">{exito}</p>}

          <div className="modal-botones">
            <button
              className="modal-btn-cancelar"
              onClick={() => navigate(`/admin/profesores/${profesorId}`)}
            >
              Cancelar
            </button>
            <button
              className="btn-guardar-verde"
              onClick={handleGuardar}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}

      {tab === "asignaciones" && (
        <div className="ppa-card">
          <div className="asignaciones-header">
            <div>
              <h3>Asignaciones docentes</h3>
              <p className="ppa-subtitulo">
                Gestiona en que cursos, grupos y asignaturas imparte clases este
                profesor
              </p>
            </div>
            <button
              className="btn-guardar-verde"
              onClick={abrirNuevaAsignacion}
            >
              <Plus size={14} /> Nueva asignacion
            </button>
          </div>

          {asignaciones.map((a, i) => {
            const estilo = estilos[i % estilos.length];
            const icono = getIconoAsignatura(a.asignatura);
            return (
              <div key={a.profesorAsignaturaId} className="asignacion-item">
                <div
                  className="row-icon-pf"
                  style={{ background: estilo.bg, color: estilo.color }}
                >
                  <FontAwesomeIcon
                    icon={icono}
                    size="2xl"
                    color={estilo.color}
                  />
                </div>
                <div>
                  <strong>{a.asignatura}</strong>
                  <p>
                    {a.curso}
                    {a.rama ? ` · ${a.rama}` : ""}
                    {a.grupo ? ` · Grupo ${a.grupo}` : ""}
                  </p>
                  <p className="asignacion-horario">
                    Horario: {a.horarioTexto}
                  </p>
                </div>
                <div className="admin-acciones-pf">
                  <button
                    className="admin-accion-btn-pf editar"
                    onClick={() => abrirEditarAsignacion(a)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="admin-accion-btn-pf eliminar"
                    onClick={() =>
                      handleEliminarAsignacion(a.profesorAsignaturaId)
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {asignaciones.length === 0 && (
            <p className="material-vacio">
              Este profesor no tiene asignaciones todavia.
            </p>
          )}

          <p className="ppa-total-asignaciones">
            Total asignaciones: {asignaciones.length}
          </p>

          {modalAsignacionAbierto && (
            <div
              className="modal-overlay"
              onClick={() => setModalAsignacionAbierto(false)}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="modal-close"
                  onClick={() => setModalAsignacionAbierto(false)}
                >
                  <X size={20} />
                </button>
                <h2>
                  {asignacionEditando
                    ? "Editar asignacion"
                    : "Nueva asignacion"}
                </h2>

                <div className="crear-curso-grid-2">
                  <div>
                    <label className="modal-label">Nivel educativo *</label>
                    <select
                      className="modal-select"
                      value={nivelSel}
                      onChange={(e) => {
                        setNivelSel(e.target.value);
                        setCursoSel("");
                        setRamaSel("");
                        setGrupoSel("");
                        setAsignaturaSel("");
                      }}
                    >
                      <option value="">Selecciona</option>
                      {nivelesDisponibles.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="modal-label">Curso *</label>
                    <select
                      className="modal-select"
                      value={cursoSel}
                      onChange={(e) => {
                        setCursoSel(e.target.value);
                        setRamaSel("");
                        setGrupoSel("");
                        setAsignaturaSel("");
                      }}
                      disabled={!nivelSel}
                    >
                      <option value="">Selecciona</option>
                      {cursosDisponibles.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {ramasDisponibles.length > 0 && (
                  <>
                    <label className="modal-label">Rama *</label>
                    <select
                      className="modal-select"
                      value={ramaSel}
                      onChange={(e) => {
                        setRamaSel(e.target.value);
                        setGrupoSel("");
                        setAsignaturaSel("");
                      }}
                    >
                      <option value="">Selecciona</option>
                      {ramasDisponibles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                {gruposDisponibles.length > 0 && (
                  <>
                    <label className="modal-label">Grupo *</label>
                    <select
                      className="modal-select"
                      value={grupoSel}
                      onChange={(e) => {
                        setGrupoSel(e.target.value);
                        setAsignaturaSel("");
                      }}
                    >
                      <option value="">Selecciona</option>
                      {gruposDisponibles.map((g) => (
                        <option key={g} value={g}>
                          Grupo {g}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                <label className="modal-label">Asignatura *</label>
                <select
                  className="modal-select"
                  value={asignaturaSel}
                  onChange={(e) => setAsignaturaSel(e.target.value)}
                  disabled={!cursoSel}
                >
                  <option value="">Selecciona una asignatura</option>
                  {asignaturasDisponibles.map((op) => (
                    <option
                      key={op.cursoAsignaturaId}
                      value={op.cursoAsignaturaId}
                    >
                      {op.asignatura}
                    </option>
                  ))}
                </select>

                {errorAsignacion && (
                  <p className="modal-error">{errorAsignacion}</p>
                )}

                <div className="modal-botones">
                  <button
                    className="modal-btn-cancelar"
                    onClick={() => setModalAsignacionAbierto(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="modal-btn-crear"
                    onClick={handleGuardarAsignacion}
                  >
                    {asignacionEditando ? "Guardar cambios" : "Asignar"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "acceso" && (
        <div className="ppa-card">
          <h3>Acceso a la plataforma</h3>

          <div className="editar-profesor-grid-2">
            <div>
              <label className="modal-label">Codigo de profesor</label>
              <input
                className="modal-input"
                value={perfil.codigo ?? ""}
                disabled
              />
            </div>
            <div>
              <label className="modal-label">Correo electronico</label>
              <input className="modal-input" value={perfil.email} disabled />
            </div>
            <div>
              <label className="modal-label">Estado de acceso</label>
              <select
                className="modal-select"
                value={perfil.estado}
                onChange={(e) =>
                  setPerfil({
                    ...perfil,
                    estado: e.target.value as "activo" | "inactivo",
                  })
                }
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div>
              <label className="modal-label">Contraseña</label>
              <input className="modal-input" value="••••••••••" disabled />
            </div>
          </div>

          <button
            className="btn-restablecer-password"
            onClick={handleAbrirReset}
          >
            Restablecer contraseña
          </button>

          {modalResetAbierto && (
            <div
              className="modal-overlay"
              onClick={() => setModalResetAbierto(false)}
            >
              <div
                className="modal-content"
                style={{ width: 420 }}
                onClick={(e) => e.stopPropagation()}
              >
                {pasoReset === "confirmar" ? (
                  <>
                    <h2>Restablecer contraseña</h2>
                    <div
                      className="modal-aviso-entregas"
                      style={{ background: "#fef3c7", color: "#92400e" }}
                    >
                      Se generara una nueva contraseña temporal que el profesor
                      debera cambiar en su proximo acceso.
                    </div>
                    <div className="modal-botones">
                      <button
                        className="modal-btn-cancelar"
                        onClick={() => setModalResetAbierto(false)}
                      >
                        Cancelar
                      </button>
                      <button
                        className="modal-btn-crear"
                        onClick={handleGenerarYEnviar}
                        disabled={enviandoReset}
                      >
                        {enviandoReset ? "Generando..." : "Generar y enviar"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2>¡Contraseña enviada!</h2>
                    <div
                      className="modal-aviso-entregas"
                      style={{ background: "#dcfce7", color: "#166534" }}
                    >
                      La nueva contraseña se ha enviado al correo del profesor.{" "}
                      {perfil.email}
                    </div>
                    <label className="modal-label">
                      Nueva contraseña temporal
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="modal-input"
                        value={passwordTemporal}
                        disabled
                        style={{ fontWeight: 700 }}
                      />
                      <button
                        className="admin-accion-btn ver"
                        onClick={handleCopiar}
                      >
                        {copiado ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="modal-botones">
                      <button
                        className="modal-btn-crear"
                        onClick={() => setModalResetAbierto(false)}
                      >
                        Cerrar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EditarProfesorAdmin;
