import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { List, Search, Calendar, Grid, ChevronRight } from "lucide-react";
import AsignaturaCard from "../../components/AsignaturaCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { getIconoAsignatura } from "../../utils/asignaturaIconos";
import { getCentroActivo } from "../../utils/auth";
import "../../styles/dashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Asignatura {
  id: number;
  nombre: string;
  descripcion: string;
  tareas_pendientes: number;
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
const asistenciaPlaceholder = 80;

function Asignaturas() {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [vistaLista, setVistaLista] = useState(false);
  const [error, setError] = useState("");
  const [filtroTareas, setFiltroTareas] = useState("todas");

  useEffect(() => {
    const cargarAsignaturas = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();

      if (!centroActivo?.id) {
        setError("No se ha seleccionado un centro activo.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/api/asignaturas/mis-asignaturas?centroId=${centroActivo.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Error al cargar asignaturas");
        }
        setAsignaturas(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar asignaturas",
        );
      } finally {
        setLoading(false);
      }
    };
    cargarAsignaturas();
  }, []);

  const asignaturasFiltradas = asignaturas.filter((a) => {
    const coincideBusqueda = a.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideFiltroTareas =
      filtroTareas === "todas" ||
      (filtroTareas === "pendientes" && a.tareas_pendientes > 0) ||
      (filtroTareas === "completadas" && a.tareas_pendientes === 0);
    return coincideBusqueda && coincideFiltroTareas;
  });

  if (loading) return <p>Cargando asignaturas...</p>;
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
    <div className="content asignaturas-page">
      <div className="asignaturas-header">
        <div>
          <h1>Mis asignaturas</h1>
          <p>
            Aqui puedes ver todas las asignaturas en las que estás inscrito.
          </p>
        </div>
        <button
          className="btn-lista"
          onClick={() => setVistaLista(!vistaLista)}
        >
          {vistaLista ? <Grid size={14} /> : <List size={14} />}
          {vistaLista ? "Ver como grid" : "Ver como lista"}
        </button>
      </div>
      <div className="asignaturas-filtros">
        <div className="buscador">
          <Search size={18} />
          <input
            placeholder="Buscar asignatura..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="filtro">
          <select className="filtro-select">
            <option value="actual">Periodo actual</option>
            <option value="anterior">Periodo anterior</option>
          </select>
        </div>
        <div className="filtro">
          <select
            className="filtro-select"
            value={filtroTareas}
            onChange={(e) => setFiltroTareas(e.target.value)}
          >
            <option value="todas">Todas las asignaturas</option>
            <option value="pendientes">Con tareas pendientes</option>
            <option value="completadas">Sin tareas pendientes</option>
          </select>
        </div>
      </div>
      {vistaLista ? (
        <div className="asignaturas-lista">
          {asignaturasFiltradas.map((a, i) => {
            const estilo = estilos[i % estilos.length];
            const icono = getIconoAsignatura(a.nombre);
            return (
              <div
                key={a.id}
                className="asignatura-row"
                onClick={() => navigate(`/asignaturas/${a.nombre}`)}
              >
                <div
                  className="row-icon"
                  style={{ background: estilo.bg, color: estilo.color }}
                >
                  <FontAwesomeIcon
                    icon={icono}
                    size="xl"
                    color={estilo.color}
                  />
                </div>
                <div className="row-info">
                  <h3>{a.nombre}</h3>
                  <p>Profesor: Por asignar</p>
                  <p
                    className="asignatura-tarea-pendiente"
                    style={
                      a.tareas_pendientes === 0
                        ? { color: "#18B300" }
                        : undefined
                    }
                  >
                    Tareas pendientes: {a.tareas_pendientes}
                  </p>
                </div>
                <div className="row-asistencia">
                  <span>Asistencia</span>
                  <div className="row-asistencia-barra">
                    <div className="progreso-bar-bg" style={{ flex: 1 }}>
                      <div
                        className="progreso-bar-fill"
                        style={{ width: "80%", background: estilo.color }}
                      />
                    </div>
                    <span className="row-porcentaje">
                      {asistenciaPlaceholder}%
                    </span>
                  </div>
                </div>
                <div className="row-nota">
                  <span>Nota actual</span>
                  <strong>-</strong>
                </div>
                <ChevronRight size={20} color="gray" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="asignaturas-grid">
          {asignaturasFiltradas.map((a, i) => {
            const estilo = estilos[i % estilos.length];
            const icono = getIconoAsignatura(a.nombre);
            return (
              <AsignaturaCard
                key={a.id}
                nombre={a.nombre}
                color={estilo.color}
                bgColor={estilo.bg}
                icono={icono}
                asistencia={asistenciaPlaceholder}
                tareasPendientes={a.tareas_pendientes}
                onClick={() => navigate(`/asignaturas/${a.nombre}`)}
              />
            );
          })}
        </div>
      )}
      <div className="resumen-general">
        <div className="resumen-item">
          <div className="resumen-icon">
            <FontAwesomeIcon icon={faGraduationCap} size="xl" />
          </div>
          <div>
            <strong>Resumen general</strong>
            <p>Periodo actual</p>
          </div>
        </div>
        <div className="resumen-stat">
          <strong>{asignaturasFiltradas.length}</strong>
          <span>Asignaturas</span>
        </div>
        {(() => {
          const totalPendientes = asignaturasFiltradas.reduce(
            (acc, a) => acc + a.tareas_pendientes,
            0,
          );
          return (
            <div className="resumen-stat">
              <strong>{totalPendientes}</strong>
              <span>
                {totalPendientes === 1 ? "Tarea pendiente" : "Tareas pendiente"}
              </span>
            </div>
          );
        })()}
        <div className="resumen-stat">
          <strong>90%</strong>
          <span>Asistencia promedio</span>
        </div>
        <button className="btn-horario">
          <Calendar size={12} /> Ver mi horario
        </button>
      </div>
    </div>
  );
}

export default Asignaturas;
