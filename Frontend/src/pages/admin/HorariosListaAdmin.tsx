import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { getCentroActivo } from "../../utils/auth";
import ConfirmarEliminarModal from "../../components/ConfirmarEliminarModal";
import "../../styles/adminAlumnos.css";
import "../../styles/adminHorariosBuilder.css";

const API_URL = import.meta.env.VITE_API_URL;

interface HorarioItem {
  id: number;
  nivel: string | null;
  cursoBase: string | null;
  rama: string | null;
  grupo: string | null;
  rangoDias: string | null;
  rangoHoras: string | null;
  totalClases: number;
}

function HorariosListaAdmin() {
  const [horarios, setHorarios] = useState<HorarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("todos");
  const [filtroCurso, setFiltroCurso] = useState("todos");
  const [filtroRama, setFiltroRama] = useState("todos");
  const [filtroGrupo, setFiltroGrupo] = useState("todos");
  const [eliminarItem, setEliminarItem] = useState<HorarioItem | null>(null);
  const navigate = useNavigate();

  const cargar = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    try {
      const res = await fetch(
        `${API_URL}/api/admin/horarios/lista?centroId=${centroActivo.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al cargar horarios");
      setHorarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar horarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar, patron estandar
    cargar();
  }, []);

  const nivelesUnicos = Array.from(
    new Set(horarios.filter((h) => h.nivel).map((h) => h.nivel)),
  ) as string[];

  const cursosDelNivel = Array.from(
    new Set(
      horarios
        .filter(
          (h) =>
            (filtroNivel === "todos" || h.nivel === filtroNivel) && h.cursoBase,
        )
        .map((h) => h.cursoBase),
    ),
  ) as string[];

  const ramasDelFiltro = Array.from(
    new Set(
      horarios
        .filter(
          (h) =>
            (filtroNivel === "todos" || h.nivel === filtroNivel) &&
            (filtroCurso === "todos" || h.cursoBase === filtroCurso) &&
            h.rama,
        )
        .map((h) => h.rama),
    ),
  ) as string[];

  const gruposDelFiltro = Array.from(
    new Set(
      horarios
        .filter(
          (h) =>
            (filtroNivel === "todos" || h.nivel === filtroNivel) &&
            (filtroCurso === "todos" || h.cursoBase === filtroCurso) &&
            (filtroRama === "todos" || h.rama === filtroRama) &&
            h.grupo,
        )
        .map((h) => h.grupo),
    ),
  ) as string[];

  const handleCambiarNivel = (v: string) => {
    setFiltroNivel(v);
    setFiltroCurso("todos");
    setFiltroRama("todos");
    setFiltroGrupo("todos");
  };

  const handleCambiarCurso = (v: string) => {
    setFiltroCurso(v);
    setFiltroRama("todos");
    setFiltroGrupo("todos");
  };

  const handleCambiarRama = (v: string) => {
    setFiltroRama(v);
    setFiltroGrupo("todos");
  };

  const horariosFiltrados = horarios.filter((h) => {
    const coincideNivel = filtroNivel === "todos" || h.nivel === filtroNivel;
    const coincideCurso =
      filtroCurso === "todos" || h.cursoBase === filtroCurso;
    const coincideRama = filtroRama === "todos" || h.rama === filtroRama;
    const coincideGrupo = filtroGrupo === "todos" || h.grupo === filtroGrupo;
    return coincideNivel && coincideCurso && coincideRama && coincideGrupo;
  });

  const handleEliminar = async () => {
    if (!eliminarItem) return;
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const res = await fetch(
      `${API_URL}/api/admin/horarios/contexto/${eliminarItem.id}?centroId=${centroActivo.id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al eliminar");
    cargar();
  };

  const badgeTexto = (h: HorarioItem) => {
    if (h.grupo) return `Grupo ${h.grupo}`;
    return h.cursoBase?.split(" ")[0] ?? "-";
  };

  const subtitulo = (h: HorarioItem) => {
    const partes = [h.rama, h.grupo ? `Grupo ${h.grupo}` : null].filter(
      Boolean,
    );
    return partes.join(" - ");
  };

  const etiquetaCompleta = (h: HorarioItem) => {
    let texto = h.cursoBase ?? "";
    if (h.rama) texto += ` · ${h.rama}`;
    if (h.grupo) texto += ` · Grupo ${h.grupo}`;
    return texto;
  };

  if (loading) return <p>Cargando horarios...</p>;
  if (error) {
    return (
      <div className="content">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="content admin-alumnos-page">
      <div className="admin-alumnos-header">
        <div>
          <h1>Horarios</h1>
          <p>Gestiona los horarios de todos los cursos del centro.</p>
        </div>
        <button
          className="btn-agregar-curso"
          onClick={() => navigate("/admin/horarios/crear")}
        >
          <Plus size={14} /> Crear horario
        </button>
      </div>

      <div className="admin-alumnos-filtros">
        <div className="filtro">
          <select
            className="filtro-select"
            value={filtroNivel}
            onChange={(e) => handleCambiarNivel(e.target.value)}
          >
            <option value="todos">Nivel: Todos</option>
            {nivelesUnicos.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="filtro">
          <select
            className="filtro-select"
            value={filtroCurso}
            onChange={(e) => handleCambiarCurso(e.target.value)}
          >
            <option value="todos">Curso: Todos</option>
            {cursosDelNivel.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="filtro">
          <select
            className="filtro-select"
            value={filtroRama}
            onChange={(e) => handleCambiarRama(e.target.value)}
          >
            <option value="todos">Rama: Todas</option>
            {ramasDelFiltro.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="filtro">
          <select
            className="filtro-select"
            value={filtroGrupo}
            onChange={(e) => setFiltroGrupo(e.target.value)}
          >
            <option value="todos">Grupo: Todos</option>
            {gruposDelFiltro.map((g) => (
              <option key={g} value={g}>
                Grupo {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="horarios-lista-columna">
        {horariosFiltrados.map((h) => (
          <div key={h.id} className="horarios-lista-fila">
            <div className="horarios-lista-fila-info">
              <span className="horarios-lista-badge">{badgeTexto(h)}</span>
              <div>
                <strong>{h.cursoBase}</strong>
                {subtitulo(h) && <p>{subtitulo(h)}</p>}
              </div>
            </div>

            <div className="horarios-lista-fila-detalle">
              {h.rangoDias ? (
                <>
                  <span>{h.rangoDias}</span>
                  <span>{h.rangoHoras}</span>
                  <span>{h.totalClases} clases programadas</span>
                </>
              ) : (
                <span>Sin clases programadas</span>
              )}
            </div>

            <div className="admin-acciones">
              <button
                className="admin-accion-btn ver"
                onClick={() => navigate(`/admin/horarios/${h.id}`)}
              >
                <Eye size={14} />
              </button>
              <button
                className="admin-accion-btn editar"
                onClick={() => navigate(`/admin/horarios/${h.id}`)}
              >
                <Pencil size={14} />
              </button>
              <button
                className="admin-accion-btn eliminar"
                onClick={() => setEliminarItem(h)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {horariosFiltrados.length === 0 && (
          <p className="material-vacio">No hay horarios creados todavia.</p>
        )}
      </div>

      <p className="admin-horarios-total">
        Mostrando {horariosFiltrados.length} resultados
      </p>

      {eliminarItem && (
        <ConfirmarEliminarModal
          titulo="Eliminar horario"
          mensaje={`¿Seguro que quieres eliminar todas las clases del horario de "${etiquetaCompleta(eliminarItem)}"?`}
          onClose={() => setEliminarItem(null)}
          onConfirmar={handleEliminar}
        />
      )}
    </div>
  );
}

export default HorariosListaAdmin;
