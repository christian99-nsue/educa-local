import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import { getCentroActivo } from "../../utils/auth";
import CrearTareaModal from "../../components/CrearTareaModal";
import "../../styles/tareasProfesor.css";

const API_URL = import.meta.env.VITE_API_URL;

interface TareaProfesor {
  id: number;
  titulo: string;
  cursoAsignaturaId: number;
  asignatura: string;
  curso: string;
  rama: string | null;
  fechaEntrega: string;
  entregasRealizadas: number;
  totalAlumnos: number;
  estado: "activa" | "cerrada" | "calificada";
}

const estadoLabel: Record<string, string> = {
  activa: "Activa",
  cerrada: "Cerrada",
  calificada: "Calificada",
};

const estadoStyle: Record<string, { bg: string; color: string }> = {
  activa: { bg: "#dbeafe", color: "#2563eb" },
  cerrada: { bg: "#ffedd5", color: "#ea580c" },
  calificada: { bg: "#dcfce7", color: "#16a34a" },
};

const PAGE_SIZE = 10;

function TareasProfesor() {
  const [tareas, setTareas] = useState<TareaProfesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [filtroAsignatura, setFiltroAsignatura] = useState("todas");
  const [modalAbierto, setModalAbierto] = useState(false);
  const navigate = useNavigate();

  const cargarTareas = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    if (!centroActivo?.id) {
      setError("No se ha seleccionado un centro activo.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/profesor/tareas/mis-tareas?centroId=${centroActivo.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Error al cargar tareas");
      }
      setTareas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tareas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar, patron estandar
    cargarTareas();
  }, []);

  const opcionesAsignatura = Array.from(
    new Map(
      tareas.map((t) => [
        t.cursoAsignaturaId,
        {
          id: t.cursoAsignaturaId,
          label: t.rama
            ? `${t.asignatura} - ${t.curso} - ${t.rama}`
            : `${t.asignatura} - ${t.curso}`,
        },
      ]),
    ).values(),
  );

  const tareasFiltradas = tareas.filter((t) => {
    const coincideBusqueda = t.titulo
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const coincideAsignatura =
      filtroAsignatura === "todas" ||
      t.cursoAsignaturaId === Number(filtroAsignatura);
    return coincideBusqueda && coincideAsignatura;
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(tareasFiltradas.length / PAGE_SIZE),
  );
  const tareasPagina = tareasFiltradas.slice(
    (pagina - 1) * PAGE_SIZE,
    pagina * PAGE_SIZE,
  );

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  if (loading) return <p>Cargando tareas...</p>;
  if (error) {
    return (
      <div className="content asignaturas-estado asignaturas-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="content-pf tareas-profesor-page">
      <div className="tareas-profesor-header">
        <div>
          <h1>Tareas</h1>
          <p>Lista de tareas creadas</p>
        </div>
        <button
          className="btn-crear-tarea"
          onClick={() => setModalAbierto(true)}
        >
          + Crear Tarea
        </button>
      </div>

      <div className="asignaturas-filtros">
        <div className="buscador">
          <Search size={18} />
          <input
            placeholder="Buscar tarea..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
          />
        </div>
        <div className="filtro-tarea-pf">
          <select
            className="filtro-select-tarea-pf"
            value={filtroAsignatura}
            onChange={(e) => {
              setFiltroAsignatura(e.target.value);
              setPagina(1);
            }}
          >
            <option value="todas">Todas las asignaturas</option>
            {opcionesAsignatura.map((op) => (
              <option key={op.id} value={op.id}>
                {op.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="tareas-profesor-tabla-wrapper">
        <table className="tareas-profesor-tabla">
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Asignatura</th>
              <th>Fecha Limite</th>
              <th>Entregas</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tareasPagina.map((t) => (
              <tr
                key={t.id}
                onClick={() => navigate(`/profesor/tareas/${t.id}`)}
              >
                <td className="col-titulo">{t.titulo}</td>
                <td className="col-asignatura">
                  <span>{t.asignatura}</span>
                  <span className="sub">{t.curso}</span>
                  {t.rama && <span className="sub">{t.rama}</span>}
                </td>
                <td>{formatearFecha(t.fechaEntrega)}</td>
                <td>
                  {t.entregasRealizadas}/{t.totalAlumnos}
                </td>
                <td>
                  <span
                    className="estado-pill"
                    style={{
                      background: estadoStyle[t.estado].bg,
                      color: estadoStyle[t.estado].color,
                    }}
                  >
                    {estadoLabel[t.estado]}
                  </span>
                </td>
                <td className="col-chevron">
                  <ChevronRight size={16} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tareasFiltradas.length > PAGE_SIZE && (
        <div className="tareas-paginacion-pf">
          <span>
            Mostrando {(pagina - 1) * PAGE_SIZE + 1} a{" "}
            {Math.min(pagina * PAGE_SIZE, tareasFiltradas.length)} de{" "}
            {tareasFiltradas.length} tareas
          </span>
          <div className="paginacion-botones-pf">
            <button
              disabled={pagina === 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              {"<"}
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={n === pagina ? "activo" : ""}
                onClick={() => setPagina(n)}
              >
                {n}
              </button>
            ))}
            <button
              disabled={pagina === totalPaginas}
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            >
              {">"}
            </button>
          </div>
        </div>
      )}

      {modalAbierto && (
        <CrearTareaModal
          onClose={() => setModalAbierto(false)}
          onCreated={() => {
            cargarTareas();
          }}
        />
      )}
    </div>
  );
}

export default TareasProfesor;
