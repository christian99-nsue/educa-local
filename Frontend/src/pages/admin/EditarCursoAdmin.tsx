import { useCallback, useEffect, useState } from "react";
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
import { getIconoAsignatura } from "../../utils/asignaturaIconos";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ConfirmarEliminarModal from "../../components/ConfirmarEliminarModal";

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

interface AsignaturaCursoItem {
  id: number;
  asignaturaId: number;
  asignatura: string;
  codigo: string | null;
  tipo: string;
}

interface CatalogoItem {
  id: number;
  nombre: string;
}

interface ProfesorCursoItem {
  asignacionId: number;
  profesorId: number;
  nombre: string;
  fotoUrl: string | null;
  asignatura: string;
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
  const [asignaturasCurso, setAsignaturasCurso] = useState<
    AsignaturaCursoItem[]
  >([]);
  const [catalogo, setCatalogo] = useState<CatalogoItem[]>([]);
  const [modalAsigCursoAbierto, setModalAsigCursoAbierto] = useState(false);
  const [nombreAsignaturaCurso, setNombreAsignaturaCurso] = useState("");
  const [tipoSelCurso, setTipoSelCurso] = useState("obligatoria");
  const [errorAsigCurso, setErrorAsigCurso] = useState("");
  const [profesoresCurso, setProfesoresCurso] = useState<ProfesorCursoItem[]>(
    [],
  );
  const [modalEliminarCurso, setModalEliminarCurso] = useState(false);
  const [modalProfesorAbierto, setModalProfesorAbierto] = useState(false);
  const [profesorSelCurso, setProfesorSelCurso] = useState("");
  const [asignaturaCursoSel, setAsignaturaCursoSel] = useState("");
  const [errorProfesorCurso, setErrorProfesorCurso] = useState("");
  const [codigoAsignaturaCurso, setCodigoAsignaturaCurso] = useState("");
  const [asignaturaCursoEditando, setAsignaturaCursoEditando] =
    useState<AsignaturaCursoItem | null>(null);

  const cargarProfesoresCurso = useCallback(async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const res = await fetch(
      `${API_URL}/api/admin/cursos/${cursoId}/profesores-curso?centroId=${centroActivo.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    if (res.ok) setProfesoresCurso(data);
  }, [cursoId]);

  const handleAsignarProfesorCurso = async () => {
    if (!profesorSelCurso || !asignaturaCursoSel) {
      setErrorProfesorCurso("Selecciona profesor y asignatura");
      return;
    }
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    try {
      const res = await fetch(
        `${API_URL}/api/admin/cursos/${cursoId}/profesores-curso`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            centroId: centroActivo.id,
            profesorId: Number(profesorSelCurso),
            cursoAsignaturaId: Number(asignaturaCursoSel),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al asignar");
      setModalProfesorAbierto(false);
      setProfesorSelCurso("");
      setAsignaturaCursoSel("");
      cargarProfesoresCurso();
    } catch (err) {
      setErrorProfesorCurso(
        err instanceof Error ? err.message : "Error al asignar",
      );
    }
  };

  const handleEliminarProfesorCurso = async (id: number) => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    await fetch(
      `${API_URL}/api/admin/cursos/profesores-curso/${id}?centroId=${centroActivo.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    cargarProfesoresCurso();
  };

  const cargarAsignaturasCurso = useCallback(async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const res = await fetch(
      `${API_URL}/api/admin/cursos/${cursoId}/asignaturas-curso?centroId=${centroActivo.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    if (res.ok) setAsignaturasCurso(data);
  }, [cursoId]);

  useEffect(() => {
    if (tab !== "asignaturas") return;
    //eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar, patron estandar
    cargarAsignaturasCurso();
    const cargarCatalogo = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      const res = await fetch(
        `${API_URL}/api/admin/cursos/catalogo-asignaturas?centroId=${centroActivo.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) setCatalogo(data);
    };
    cargarCatalogo();
  }, [tab, cargarAsignaturasCurso]);

  const abrirNuevaAsignaturaCurso = () => {
    setAsignaturaCursoEditando(null);
    setNombreAsignaturaCurso("");
    setCodigoAsignaturaCurso("");
    setTipoSelCurso("obligatoria");
    setErrorAsigCurso("");
    setModalAsigCursoAbierto(true);
  };

  const abrirEditarAsignaturaCurso = (a: AsignaturaCursoItem) => {
    setAsignaturaCursoEditando(a);
    setNombreAsignaturaCurso(a.asignatura);
    setCodigoAsignaturaCurso(a.codigo ?? "");
    setTipoSelCurso(a.tipo);
    setErrorAsigCurso("");
    setModalAsigCursoAbierto(true);
  };

  const handleGuardarAsignaturaCurso = async () => {
    if (!nombreAsignaturaCurso.trim()) {
      setErrorAsigCurso("Escribe el nombre de la asignatura");
      return;
    }

    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    try {
      if (asignaturaCursoEditando) {
        console.log("DATOS PUT:", {
          centroId: centroActivo.id,
          asignaturaId: asignaturaCursoEditando.asignaturaId,
          nombreAsignatura: nombreAsignaturaCurso,
          codigo: codigoAsignaturaCurso,
          tipo: tipoSelCurso,
        });
        console.log("ASIGNATURA CURSO EDITANDO:", asignaturaCursoEditando);
        const res = await fetch(
          `${API_URL}/api/admin/cursos/asignaturas-curso/${asignaturaCursoEditando.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              centroId: centroActivo.id,
              asignaturaId: asignaturaCursoEditando.asignaturaId,
              nombreAsignatura: nombreAsignaturaCurso,
              codigo: codigoAsignaturaCurso,
              tipo: tipoSelCurso,
            }),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Error al guardar");
      } else {
        const res = await fetch(
          `${API_URL}/api/admin/cursos/${cursoId}/asignaturas-curso`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              centroId: centroActivo.id,
              nombreAsignatura: nombreAsignaturaCurso,
              codigo: codigoAsignaturaCurso,
              tipo: tipoSelCurso,
            }),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Error al añadir");
      }
      setModalAsigCursoAbierto(false);
      cargarAsignaturasCurso();
    } catch (err) {
      setErrorAsigCurso(
        err instanceof Error ? err.message : "Error al guardar",
      );
    }
  };

  const handleEliminarAsignaturaCurso = async (id: number) => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const res = await fetch(
      `${API_URL}/api/admin/cursos/asignaturas-curso/${id}?centroId=${centroActivo.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Error al eliminar");
      return;
    }
    cargarAsignaturasCurso();
  };

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
    if (tab !== "profesores") return;
    const cargarDatos = async () => {
      await cargarProfesoresCurso();
      await cargarAsignaturasCurso();
    };
    cargarDatos();
  }, [tab, cargarProfesoresCurso, cargarAsignaturasCurso]);

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

  const handleEliminarCursoCompleto = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const res = await fetch(
      `${API_URL}/api/admin/cursos/${cursoId}?centroId=${centroActivo.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al eliminar");
    navigate("/admin/cursos");
  };

  const getIniciales = (nombreCompleto: string) => {
    const partes = nombreCompleto.split(" ");
    return `${partes[0]?.[0] ?? ""}${partes[1]?.[0] ?? ""}`.toUpperCase();
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
          <div className="asignaciones-header">
            <div>
              <h3>Asignaturas del curso</h3>
              <p className="ppa-subtitulo">
                Gestiona las asignaturas que se imparten en este curso.
              </p>
            </div>
            <button
              className="btn-guardar-verde"
              onClick={abrirNuevaAsignaturaCurso}
            >
              <Plus size={14} /> Añadir asignatura
            </button>
          </div>

          {asignaturasCurso.map((a, i) => {
            const estilo = estilos[i % estilos.length];
            const icono = getIconoAsignatura(a.asignatura);
            return (
              <div key={a.id} className="asignatura-curso-item">
                <div
                  className="row-icon-ad"
                  style={{ background: estilo.bg, color: estilo.color }}
                >
                  <FontAwesomeIcon
                    icon={icono}
                    size="sm"
                    color={estilo.color}
                  />
                </div>
                <strong>
                  {a.asignatura} {a.codigo && ` (${a.codigo})`}
                </strong>
                <span
                  className={`tipo-pill ${a.tipo === "obligatoria" ? "tipo-obligatoria" : "tipo-optativa"}`}
                >
                  {a.tipo === "obligatoria" ? "Obligatoria" : "Optativa"}
                </span>
                <div className="admin-acciones">
                  <button
                    className="admin-accion-btn editar"
                    onClick={() => abrirEditarAsignaturaCurso(a)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="admin-accion-btn eliminar"
                    onClick={() => handleEliminarAsignaturaCurso(a.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {asignaturasCurso.length === 0 && (
            <p className="material-vacio">
              Este curso no tiene asignaturas todavia.
            </p>
          )}
          {modalAsigCursoAbierto && (
            <div
              className="modal-overlay"
              onClick={() => setModalAsigCursoAbierto(false)}
            >
              <div
                className="modal-content"
                style={{ width: 420 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="modal-close"
                  onClick={() => setModalAsigCursoAbierto(false)}
                >
                  <X size={20} />
                </button>
                <h2>
                  {asignaturaCursoEditando
                    ? "Editar asignatura"
                    : "Añadir asignatura"}
                </h2>
                <label className="modal-label">Nombre de la Asignatura *</label>
                <input
                  className="modal-select"
                  list="sugerencias-asignaturas"
                  value={nombreAsignaturaCurso}
                  placeholder="Ej: Matematicas"
                  onChange={(e) => setNombreAsignaturaCurso(e.target.value)}
                />
                <datalist id="sugerencias-asignaturas">
                  {catalogo.map((c) => (
                    <option key={c.id} value={c.nombre} />
                  ))}
                </datalist>
                {!abrirEditarAsignaturaCurso && (
                  <p className="ppa-ayuda">
                    Si la asignatura ya existe en el centro, se reutilizara. Si
                    no, se creara nueva.
                  </p>
                )}
                <label className="modal-label">Codigo (opcional)</label>
                <input
                  className="modal-input"
                  placeholder="Ej: MAT-1"
                  value={codigoAsignaturaCurso}
                  onChange={(e) => setCodigoAsignaturaCurso(e.target.value)}
                />
                <label className="modal-label">Tipo *</label>
                <select
                  className="modal-select"
                  value={tipoSelCurso}
                  onChange={(e) => setTipoSelCurso(e.target.value)}
                >
                  <option value="obligatoria">Obligatoria</option>
                  <option value="optativa">Optativa</option>
                </select>

                {errorAsigCurso && (
                  <p className="modal-error">{errorAsigCurso}</p>
                )}

                <div className="modal-botones">
                  <button
                    className="modal-btn-cancelar"
                    onClick={() => setModalAsigCursoAbierto(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="modal-btn-crear"
                    onClick={handleGuardarAsignaturaCurso}
                  >
                    {asignaturaCursoEditando ? "Guardar cambios" : "Añadir"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "profesores" && (
        <div className="ppa-card">
          <div className="asignaciones-header">
            <div>
              <h3>Profesores asignados</h3>
              <p className="ppa-subtitulo">
                Gestiona los profesores que imparten clases en este curso.
              </p>
            </div>
            <button
              className="btn-guardar-verde"
              onClick={() => setModalProfesorAbierto(true)}
            >
              <Plus size={14} /> Asignar profesor
            </button>
          </div>

          {profesoresCurso.map((p) => (
            <div
              key={p.asignacionId}
              className="dca-profesor-item"
              style={{ padding: "10px 0", borderBottom: "1px solid #f2f2f2" }}
            >
              {p.fotoUrl ? (
                <img
                  src={p.fotoUrl || "/vite.svg"}
                  alt={p.nombre}
                  className="dca-profesor-avatar"
                />
              ) : (
                <span className="admin-alumno-avatar">
                  {getIniciales(p.nombre)}
                </span>
              )}
              <div>
                <strong>{p.nombre}</strong>
                <p>{p.asignatura}</p>
              </div>
              <div className="admin-acciones-pf">
                <button
                  className="admin-accion-btn eliminar"
                  onClick={() => handleEliminarProfesorCurso(p.asignacionId)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {profesoresCurso.length === 0 && (
            <p className="material-vacio">
              Este curso no tiene profesores asignados todavia.
            </p>
          )}

          {modalProfesorAbierto && (
            <div
              className="modal-overlay"
              onClick={() => setModalProfesorAbierto(false)}
            >
              <div
                className="modal-content"
                style={{ width: 420 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="modal-close"
                  onClick={() => setModalProfesorAbierto(false)}
                >
                  <X size={20} />
                </button>
                <h2>Asignar profesor</h2>

                <label className="modal-label">Profesor *</label>
                <select
                  className="modal-select"
                  value={profesorSelCurso}
                  onChange={(e) => setProfesorSelCurso(e.target.value)}
                >
                  <option value="">Selecciona un profesor</option>
                  {profesoresOpciones.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>

                <label className="modal-label">Asignatura *</label>
                <select
                  className="modal-select"
                  value={asignaturaCursoSel}
                  onChange={(e) => setAsignaturaCursoSel(e.target.value)}
                >
                  <option value="">Selecciona una asignatura</option>
                  {asignaturasCurso.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.asignatura} {a.codigo && `(${a.codigo})`}
                    </option>
                  ))}
                </select>

                {errorProfesorCurso && (
                  <p className="modal-error">{errorProfesorCurso}</p>
                )}

                <div className="modal-botones">
                  <button
                    className="modal-btn-cancelar"
                    onClick={() => setModalProfesorAbierto(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="modal-btn-crear"
                    onClick={handleAsignarProfesorCurso}
                  >
                    Asignar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "config" && (
        <div className="ppa-card">
          <h3>Zona de peligro</h3>
          <div className="ppa-zona-peligro">
            <div className="ppa-peligro-item">
              <Trash2 size={18} color="#dc2626" />
              <div>
                <strong>Eliminar curso</strong>
                <p>
                  Esta accion no se puede deshacer. Se eliminaran las
                  asignaturas y profesores asociados. No se puede eliminar un
                  curso con alumnos matriculados.
                </p>
              </div>
              <button
                className="btn-peligro-rojo"
                onClick={() => setModalEliminarCurso(true)}
              >
                Eliminar curso
              </button>
            </div>
          </div>

          {modalEliminarCurso && (
            <ConfirmarEliminarModal
              titulo="Eliminar curso"
              mensaje={`¿Seguro que quieres eliminar "${titulo}"? Esta accion no se puede deshacer.`}
              onClose={() => setModalEliminarCurso(false)}
              onConfirmar={handleEliminarCursoCompleto}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default EditarCursoAdmin;
