import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  Users,
  Lightbulb,
} from "lucide-react";
import { getCentroActivo } from "../../utils/auth";
import "../../styles/admin/adminDetalleCurso.css";

const API_URL = import.meta.env.VITE_API_URL;

interface ProfesorOpcion {
  id: number;
  nombre: string;
}

interface CursoEditable {
  cursoBase: string | null;
  nivel: string | null;
  rama: string | null;
  codigo: string | null;
  descripcion: string | null;
  estado: string;
  tutor: { id: number; nombre: string } | null;
}

interface GrupoItem {
  id: number;
  grupo: string | null;
  estado: string;
  tutorId: number | null;
  tutor: string | null;
  totalAlumnos: number;
}

function EditarCursoAdmin() {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<
    "info" | "grupos" | "asignaturas" | "profesores" | "config"
  >("info");

  const [curso, setCurso] = useState<CursoEditable | null>(null);
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("activo");
  const [tutorId, setTutorId] = useState("");
  const [profesoresOpciones, setProfesoresOpciones] = useState<
    ProfesorOpcion[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [grupos, setGrupos] = useState<GrupoItem[]>([]);
  const [modalGrupoAbierto, setModalGrupoAbierto] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState<GrupoItem | null>(null);
  const [nombreGrupoNuevo, setNombreGrupoNuevo] = useState("");
  const [tutorGrupoSel, setTutorGrupoSel] = useState("");
  const [estadoGrupoSel, setEstadoGrupoSel] = useState("activo");
  const [errorGrupo, setErrorGrupo] = useState("");

  const cargarGrupos = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const res = await fetch(
      `${API_URL}/api/admin/cursos/${cursoId}/grupos?centroId=${centroActivo.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    if (res.ok) setGrupos(data);
  };

  useEffect(() => {
    if (tab !== "grupos") return;

    let cancelado = false;

    const cargar = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();

      if (!centroActivo?.id) return;

      const res = await fetch(
        `${API_URL}/api/admin/cursos/${cursoId}/grupos?centroId=${centroActivo.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();

      if (res.ok && !cancelado) {
        setGrupos(data);
      }
    };

    cargar();

    return () => {
      cancelado = true;
    };
  }, [tab, cursoId]);

  const abrirNuevoGrupo = () => {
    setGrupoEditando(null);
    setNombreGrupoNuevo("");
    setTutorGrupoSel("");
    setEstadoGrupoSel("activo");
    setErrorGrupo("");
    setModalGrupoAbierto(true);
  };

  const abrirEditarGrupo = (g: GrupoItem) => {
    setGrupoEditando(g);
    setTutorGrupoSel(g.tutorId ? String(g.tutorId) : "");
    setEstadoGrupoSel(g.estado);
    setErrorGrupo("");
    setModalGrupoAbierto(true);
  };

  const handleGuardarGrupo = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    try {
      if (grupoEditando) {
        const res = await fetch(
          `${API_URL}/api/admin/cursos/grupos/${grupoEditando.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              centroId: centroActivo.id,
              tutorId: tutorGrupoSel ? Number(tutorGrupoSel) : null,
              estado: estadoGrupoSel,
            }),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Error al guardar");
      } else {
        if (!nombreGrupoNuevo) {
          setErrorGrupo("Escribe el nombre del grupo (ej: D)");
          return;
        }
        const res = await fetch(
          `${API_URL}/api/admin/cursos/${cursoId}/grupos`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              centroId: centroActivo.id,
              grupo: nombreGrupoNuevo,
              tutorId: tutorGrupoSel ? Number(tutorGrupoSel) : null,
            }),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Error al crear el grupo");
      }
      setModalGrupoAbierto(false);
      cargarGrupos();
    } catch (err) {
      setErrorGrupo(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  const handleEliminarGrupo = async (id: number) => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const res = await fetch(
      `${API_URL}/api/admin/cursos/grupos/${id}?centroId=${centroActivo.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Error al eliminar el grupo");
      return;
    }
    cargarGrupos();
  };

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      try {
        const [resCurso, resProfesores] = await Promise.all([
          fetch(
            `${API_URL}/api/admin/cursos/${cursoId}/detalle?centroId=${centroActivo.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
          fetch(
            `${API_URL}/api/admin/cursos/profesores-tutor?centroId=${centroActivo.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
        ]);
        const dataCurso = await resCurso.json();
        const dataProfesores = await resProfesores.json();
        if (!resCurso.ok)
          throw new Error(dataCurso?.error || "Error al cargar el curso");

        setCurso(dataCurso);
        setCodigo(dataCurso.codigo ?? "");
        setDescripcion(dataCurso.descripcion ?? "");
        setEstado(dataCurso.estado ?? "activo");
        setTutorId(dataCurso.tutor ? String(dataCurso.tutor.id) : "");
        setProfesoresOpciones(dataProfesores);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar el curso",
        );
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [cursoId]);

  const handleGuardarInfo = async () => {
    setGuardando(true);
    setError("");
    setExito("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    try {
      const res = await fetch(
        `${API_URL}/api/admin/cursos/${cursoId}/informacion`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            centroId: centroActivo.id,
            codigo,
            descripcion,
            estado,
            tutorId: tutorId ? Number(tutorId) : null,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al guardar");
      setExito("Cambios guardados correctamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p>Cargando curso...</p>;
  if (error && !curso) {
    return (
      <div className="content">
        <p>{error}</p>
      </div>
    );
  }
  if (!curso) return null;

  const titulo = curso.rama
    ? `${curso.cursoBase} - ${curso.rama}`
    : curso.cursoBase;

  return (
    <div className="content editar-curso-admin-page">
      <div className="detalle-asig-breadcrumb">
        <span onClick={() => navigate("/admin/cursos")}>Cursos</span>
        <ChevronRight size={12} /> <strong>{curso.cursoBase}</strong>
      </div>
      <h1>Editar curso</h1>
      <p className="subtitle">{titulo}</p>

      <div className="editar-profesor-tabs">
        <button
          className={tab === "info" ? "activo" : ""}
          onClick={() => setTab("info")}
        >
          Informacion general
        </button>
        <button
          className={tab === "grupos" ? "activo" : ""}
          onClick={() => setTab("grupos")}
        >
          Grupos
        </button>
        <button
          className={tab === "asignaturas" ? "activo" : ""}
          onClick={() => setTab("asignaturas")}
        >
          Asignaturas
        </button>
        <button
          className={tab === "profesores" ? "activo" : ""}
          onClick={() => setTab("profesores")}
        >
          Profesores
        </button>
        <button
          className={tab === "config" ? "activo" : ""}
          onClick={() => setTab("config")}
        >
          Configuracion
        </button>
      </div>

      {tab === "info" && (
        <div className="ppa-card">
          <div className="editar-curso-grid-2">
            <div>
              <label className="modal-label">Nivel educativo</label>
              <input
                className="modal-input"
                value={curso.nivel ?? ""}
                disabled
              />
            </div>
            <div>
              <label className="modal-label">Curso</label>
              <input
                className="modal-input"
                value={curso.cursoBase ?? ""}
                disabled
              />
            </div>
            <div>
              <label className="modal-label">Rama</label>
              <input
                className="modal-input"
                value={curso.rama ?? "-"}
                disabled
              />
            </div>
            <div>
              <label className="modal-label">Codigo *</label>
              <input
                className="modal-input"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
              <p className="ppa-ayuda">
                Codigo unico para identificar el curso.
              </p>
            </div>
          </div>

          <label className="modal-label">Descripcion</label>
          <textarea
            className="modal-textarea"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <div className="editar-curso-grid-2">
            <div>
              <label className="modal-label">Tutor / Responsable</label>
              <select
                className="modal-select"
                value={tutorId}
                onChange={(e) => setTutorId(e.target.value)}
              >
                <option value="">Sin asignar</option>
                {profesoresOpciones.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="modal-label">Estado</label>
              <select
                className="modal-select"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
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
              onClick={() => navigate(`/admin/cursos/${cursoId}`)}
            >
              Cancelar
            </button>
            <button
              className="btn-guardar-verde"
              onClick={handleGuardarInfo}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}

      {tab === "grupos" && (
        <div className="ppa-card">
          <div className="asignaciones-header">
            <div>
              <h3>Grupos del curso</h3>
              <p className="ppa-subtitulo">
                Gestiona los grupos o secciones que pertenecen a este curso.
              </p>
            </div>
            <button className="btn-guardar-verde" onClick={abrirNuevoGrupo}>
              <Plus size={14} /> Nuevo grupo
            </button>
          </div>

          {grupos.map((g) => (
            <div key={g.id} className="dca-grupo-item">
              <Users size={16} color="#2563eb" />
              <div>
                <strong>Grupo {g.grupo}</strong>
                <p>
                  {g.totalAlumnos} alumnos {g.tutor && `· Tutor: ${g.tutor}`}
                </p>
              </div>

              <div className="admin-acciones-pf">
                <span
                  className={`estado-pill-pf ${g.estado === "activo" ? "estado-activo" : "estado-inactivo"}`}
                >
                  {g.estado === "activo" ? "Activo" : "Inactivo"}
                </span>
                <button
                  className="admin-accion-btn editar"
                  onClick={() => abrirEditarGrupo(g)}
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="admin-accion-btn eliminar"
                  onClick={() => handleEliminarGrupo(g.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {grupos.length === 0 && (
            <p className="material-vacio">
              Este curso no tiene grupos todavia.
            </p>
          )}

          {modalGrupoAbierto && (
            <div
              className="modal-overlay"
              onClick={() => setModalGrupoAbierto(false)}
            >
              <div
                className="modal-content"
                style={{ width: 420 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="modal-close"
                  onClick={() => setModalGrupoAbierto(false)}
                >
                  <X size={20} />
                </button>
                <h2>
                  {grupoEditando
                    ? `Editar Grupo ${grupoEditando.grupo}`
                    : "Nuevo grupo"}
                </h2>

                {!grupoEditando && (
                  <>
                    <label className="modal-label">Nombre del grupo *</label>
                    <input
                      className="modal-input"
                      placeholder="Ej: D"
                      value={nombreGrupoNuevo}
                      onChange={(e) => setNombreGrupoNuevo(e.target.value)}
                    />
                  </>
                )}

                <label className="modal-label">Tutor / Responsable</label>
                <select
                  className="modal-select"
                  value={tutorGrupoSel}
                  onChange={(e) => setTutorGrupoSel(e.target.value)}
                >
                  <option value="">Sin asignar</option>
                  {profesoresOpciones.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>

                {grupoEditando && (
                  <>
                    <label className="modal-label">Estado</label>
                    <select
                      className="modal-select"
                      value={estadoGrupoSel}
                      onChange={(e) => setEstadoGrupoSel(e.target.value)}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </>
                )}

                {errorGrupo && <p className="modal-error">{errorGrupo}</p>}

                <div className="modal-botones">
                  <button
                    className="modal-btn-cancelar"
                    onClick={() => setModalGrupoAbierto(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="modal-btn-crear"
                    onClick={handleGuardarGrupo}
                  >
                    {grupoEditando ? "Guardar cambios" : "Crear grupo"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div
            className="modal-aviso-entregas"
            style={{ background: "#eef4ff", color: "#2563eb", marginTop: 16 }}
          >
            <Lightbulb size={12} fill="#ffc30e" color="#ffc30e" /> Puedes editar
            cada grupo para asignarle un tutor o cambiar su estado.
          </div>
        </div>
      )}

      {tab === "asignaturas" && (
        <div className="ppa-card">
          <p className="material-vacio">
            Pestaña de Asignaturas — la construimos mas adelante.
          </p>
        </div>
      )}

      {tab === "profesores" && (
        <div className="ppa-card">
          <p className="material-vacio">
            Pestaña de Profesores — la construimos mas adelante.
          </p>
        </div>
      )}

      {tab === "config" && (
        <div className="ppa-card">
          <p className="material-vacio">
            Pestaña de Configuracion — la construimos mas adelante.
          </p>
        </div>
      )}
    </div>
  );
}

export default EditarCursoAdmin;
