import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import TareaCard from "../../components/TareaCard";
import { getIconoAsignatura } from "../../utils/asignaturaIconos";
import { getCentroActivo } from "../../utils/auth";
import "../../styles/Tareas.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Tarea {
  id: number;
  titulo: string;
  asignatura: string;
  fechaEntrega: string;
  diasRestantes: number;
  estado: "activa" | "atrasada" | "entregada" | "calificada";
  nota: number | null;
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

const PAGE_SIZE = 10;

function Tareas() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [filtroAsignatura, setFiltroAsignatura] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [sistemaCalificacion, setSistemaCalificacion] = useState<
    "sobre 10" | "sobre 100" | "A-F"
  >("sobre 10");

  useEffect(() => {
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
          `${API_URL}/api/tareas/mis-tareas?centroId=${centroActivo.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Error al cargar tareas");
        }
        setTareas(Array.isArray(data.tareas) ? data.tareas : []);
        setSistemaCalificacion(data.sistemaCalificacion ?? "sobre 10");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar tareas");
      } finally {
        setLoading(false);
      }
    };
    cargarTareas();
  }, []);

  const asignaturasUnicas = Array.from(
    new Set(tareas.map((t) => t.asignatura)),
  );

  const tareasFiltradas = tareas.filter((t) => {
    const coincideBusqueda = t.titulo
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const coincideAsignatura =
      filtroAsignatura === "todas" || t.asignatura === filtroAsignatura;
    const coincideEstado =
      filtroEstado === "todos" || t.estado === filtroEstado;
    return coincideBusqueda && coincideAsignatura && coincideEstado;
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(tareasFiltradas.length / PAGE_SIZE),
  );
  const tareasPagina = tareasFiltradas.slice(
    (pagina - 1) * PAGE_SIZE,
    pagina * PAGE_SIZE,
  );

  const contar = (estado: string) =>
    tareas.filter((t) => t.estado === estado).length;

  if (loading) return <p>Cargando tareas...</p>;
  if (error) {
    return (
      <div className="content asignaturas-estado asignaturas-error">
        <p>{error}</p>
        <p className="asignaturas-error-ayuda">
          Si crees que esto es un error, contacta con el administrador de tu
          centro.
        </p>
      </div>
    );
  }

  return (
    <div className="content tareas-page">
      <h1>Gestion de tareas</h1>
      <p className="subtitle">
        Administra y da seguimiento a todas tus tareas.
      </p>

      <div className="tareas-summary-grid">
        <div className="summary-card-tr">
          <span className="icon-title">Total de tareas</span>
          <strong>{tareas.length}</strong>
          <span className="summary-sub">Todas las tareas</span>
        </div>
        <div className="summary-card-tr">
          <span className="icon-title">Activas</span>
          <strong style={{ color: "#18B300" }}>{contar("activa")}</strong>
          <span className="summary-sub">En curso</span>
        </div>
        <div className="summary-card-tr">
          <span className="icon-title">Atrasadas</span>
          <strong style={{ color: "#FC4850" }}>{contar("atrasada")}</strong>
          <span className="summary-sub">Con retraso</span>
        </div>
        <div className="summary-card-tr">
          <span className="icon-title">Entregadas</span>
          <strong style={{ color: "#59ADFF" }}>{contar("entregada")}</strong>
          <span className="summary-sub">Completadas</span>
        </div>
        <div className="summary-card-tr">
          <span className="icon-title">Calificadas</span>
          <strong style={{ color: "#B032E7" }}>{contar("calificada")}</strong>
          <span className="summary-sub">Evaluadas</span>
        </div>
      </div>

      <div className="asignaturas-filtros">
        <div className="buscador">
          <Search size={18} />
          <input
            placeholder="Buscar Tarea"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
          />
        </div>
        <div className="filtro">
          <select
            className="filtro-select"
            value={filtroAsignatura}
            onChange={(e) => {
              setFiltroAsignatura(e.target.value);
              setPagina(1);
            }}
          >
            <option value="todas">Todas las asignaturas</option>
            {asignaturasUnicas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="filtro">
          <select
            className="filtro-select"
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value);
              setPagina(1);
            }}
          >
            <option value="todos">Todos los estados</option>
            <option value="activa">Activas</option>
            <option value="atrasada">Atrasadas</option>
            <option value="entregada">Entregadas</option>
            <option value="calificada">Calificadas</option>
          </select>
        </div>
      </div>

      <p className="tareas-titulo-lista">Todas las tareas</p>

      <div className="tareas-lista">
        {tareasPagina.map((t, i) => {
          const estilo = estilos[i % estilos.length];
          const icono = getIconoAsignatura(t.asignatura);
          return (
            <TareaCard
              key={t.id}
              titulo={t.titulo}
              asignatura={t.asignatura}
              fechaEntrega={t.fechaEntrega}
              diasRestantes={t.diasRestantes}
              estado={t.estado}
              nota={t.nota}
              sistemaCalificacion={sistemaCalificacion}
              color={estilo.color}
              bgColor={estilo.bg}
              icono={icono}
              onClick={() => navigate(`/alumno/tareas/${t.titulo}`)}
            />
          );
        })}
      </div>

      <div className="tareas-paginacion">
        <span>
          Mostrando{" "}
          {tareasFiltradas.length === 0 ? 0 : (pagina - 1) * PAGE_SIZE + 1} a{" "}
          {Math.min(pagina * PAGE_SIZE, tareasFiltradas.length)} de{" "}
          {tareasFiltradas.length} tareas
        </span>
        <div className="paginacion-botones">
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
            onClick={() => setPagina(() => Math.min(pagina + 1, totalPaginas))}
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Tareas;
