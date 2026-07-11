import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Grid, List, Search, ChevronRight } from "lucide-react";
import { getIconoAsignatura } from "../../utils/asignaturaIconos";
import AsignaturaCardProfesor from "../../components/AsignaturaCardProfesor";
import { useNavigate } from "react-router-dom";
import { getCentroActivo } from "../../utils/auth";
import "../../styles/dashboardProfesor.css";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

const API_URL = import.meta.env.VITE_API_URL;

interface AsignaturaProfesor {
  curso_asignatura_id: number;
  id: number;
  nombre: string;
  codigo: string | null;
  curso: string;
  rama: string | null;
  curso_id: number;
  total_alumnos: number;
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

function AsignaturasProfesor() {
  const [vistaLista, setVistaLista] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("actual");
  const navigate = useNavigate();
  const [asignaturas, setAsignaturas] = useState<AsignaturaProfesor[]>([]);

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
          `${API_URL}/api/profesor/asignaturas/mis-asignaturas?centroId=${centroActivo.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
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

  const asignaturasFiltradas = asignaturas.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  if (loading) return <p>Cargando asignaturas...</p>;
  if (error) {
    return (
      <div className="content-pf asignaturas-estado asignaturas-error">
        <p>{error}</p>
        <p className="asignaturas-error-ayuda">
          {" "}
          Si crees que esto es un error, contacta con el administrador de tu
          centro.
        </p>
      </div>
    );
  }
  return (
    <div className="content-pf asignaturas-page-pf">
      <div className="asignaturas-header-pf">
        <div>
          <h1>Mis asignaturas</h1>
          <p>Gestiona todas tus asignaturas y clases</p>
        </div>
        <button
          className="btn-lista-pf"
          onClick={() => setVistaLista(!vistaLista)}
        >
          {vistaLista ? <Grid size={14} /> : <List size={14} />}
          {vistaLista ? "Ver como grid" : "Ver como lista"}
        </button>
      </div>
      <div className="asignaturas-filtro-pf">
        <div className="buscador-pf">
          <Search size={18} />
          <input
            placeholder="Buscar asignatura"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="filtro-pf">
          <select
            className="filtro-select-pf"
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
          >
            <option value="actual">Periodo actual</option>
            <option value="anterior">Periodo anterior</option>
          </select>
        </div>
      </div>
      {vistaLista ? (
        <div className="asignaturas-lista-pf">
          {asignaturasFiltradas.map((a, i) => {
            const estilo = estilos[i % estilos.length];
            const icono = getIconoAsignatura(a.nombre);
            return (
              <div
                key={a.curso_asignatura_id}
                className="asignatura-row-pf"
                onClick={() =>
                  navigate(`/profesor/asignatura/${a.nombre}/curso/${a.curso}`)
                }
              >
                <div
                  className="row-icon-pf"
                  style={{ background: estilo.bg, color: estilo.color }}
                >
                  <FontAwesomeIcon
                    icon={icono}
                    size="lg"
                    color={estilo.color}
                  />
                </div>
                <div className="row-info-pf">
                  <h3>{a.nombre}</h3>
                  <p>Curso: {a.curso}</p>
                  {a.rama && <p>{a.rama}</p>}
                  <p>Codigo: {a.codigo ?? "-"}</p>
                </div>
                <div className="row-alumnos-pf">
                  <span>
                    <FontAwesomeIcon icon={faUsers} /> {a.total_alumnos} alumnos
                  </span>
                </div>
                <ChevronRight size={14} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="asignaturas-grid-pf">
          {asignaturasFiltradas.map((a, i) => {
            const estilo = estilos[i % estilos.length];
            const icono = getIconoAsignatura(a.nombre);
            return (
              <AsignaturaCardProfesor
                key={a.curso_asignatura_id}
                nombre={a.nombre}
                curso={a.curso}
                rama={a.rama}
                codigo={a.codigo}
                totalAlumnos={a.total_alumnos}
                color={estilo.color}
                bgColor={estilo.bg}
                icono={<FontAwesomeIcon icon={icono} size="lg" />}
                onClick={() =>
                  navigate(`/profesor/asignaturas/${a.nombre}/curso/${a.curso}`)
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AsignaturasProfesor;
