import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, CheckCircle2, Clock } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faBookOpen,
  faFilePdf,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { getIconoAsignatura } from "../../utils/asignaturaIconos";
import { getCentroActivo } from "../../utils/auth";
import { ChevronRight } from "lucide-react";
import "../../styles/alumno/calificaciones.css";

const API_URL = import.meta.env.VITE_API_URL;

interface AsignaturaCalificacion {
  cursoAsignaturaId: number;
  asignatura: string;
  profesor: string;
  promedio: string | null;
  totalActividades: number;
  actividadesCalificadas: number;
  pendientesCalificar: number;
  estado: string | null;
  estadoColor: { bg: string; color: string } | null;
}

interface CalificacionesData {
  sistemaCalificacion: string;
  promedioGeneral: string | null;
  estadoGeneral: string | null;
  totalAsignaturas: number;
  totalActividadesCalificadas: number;
  totalPendientesCalificar: number;
  asignaturas: AsignaturaCalificacion[];
}

const estilos = [
  { bg: "#f0d5fc", color: "#B032E7" },
  { bg: "#c5def8", color: "#59ADFF" },
  { bg: "#ffeba1", color: "#F8C822" },
  { bg: "#ddffd8", color: "#18B300" },
  { bg: "#e6e6e6", color: "#686868" },
];

function Calificaciones() {
  const [data, setData] = useState<CalificacionesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroAsignatura, setFiltroAsignatura] = useState("todas");
  const [mostrarExportar, setMostrarExportar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      if (!centroActivo?.id) {
        setError("No se ha seleccionado un centro activo.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${API_URL}/api/alumno/calificaciones/mis-calificaciones?centroId=${centroActivo.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const json = await res.json();
        if (!res.ok)
          throw new Error(json?.error || "Error al cargar calificaciones");
        setData(json);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar calificaciones",
        );
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    const cerrarDropdown = () => setMostrarExportar(false);
    if (mostrarExportar) {
      document.addEventListener("click", cerrarDropdown);
    }
    return () => document.removeEventListener("click", cerrarDropdown);
  }, [mostrarExportar]);

  if (loading) return <p>Cargando calificaciones...</p>;
  if (error || !data) {
    return (
      <div className="content asignaturas-estado asignaturas-error">
        <p>{error}</p>
      </div>
    );
  }

  const asignaturasFiltradas =
    filtroAsignatura === "todas"
      ? data.asignaturas
      : data.asignaturas.filter(
          (a) => String(a.cursoAsignaturaId) === filtroAsignatura,
        );

  const formatearPromedio = (promedio: string | null) => {
    return promedio ?? "-";
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Mis Calificaciones", 14, 15);
    doc.setFontSize(10);
    doc.text(
      `Promedio general: ${formatearPromedio(data.promedioGeneral)}`,
      14,
      22,
    );

    autoTable(doc, {
      startY: 28,
      head: [["Asignatura", "Promedio", "Actividades calificadas", "Estado"]],
      body: asignaturasFiltradas.map((a) => [
        a.asignatura,
        formatearPromedio(a.promedio),
        `${a.actividadesCalificadas}/${a.totalActividades}`,
        a.estado ?? "-",
      ]),
    });

    doc.save("mis_calificaciones.pdf");
    setMostrarExportar(false);
  };

  const exportarExcel = () => {
    const filas = asignaturasFiltradas.map((a) => ({
      Asignatura: a.asignatura,
      Profesor: a.profesor,
      Promedio: formatearPromedio(a.promedio),
      "Actividades calificadas": `${a.actividadesCalificadas}/${a.totalActividades}`,
      Estado: a.estado ?? "-",
    }));
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Calificaciones");
    XLSX.writeFile(libro, "mis_calificaciones.xlsx");
    setMostrarExportar(false);
  };

  return (
    <div className="content calificaciones-page">
      <h1>Mis Calificaciones</h1>
      <p className="subtitle">
        Consulta tu rendimiento academico por asignatura y actividad.
      </p>

      <div className="calificaciones-summary-grid">
        <div className="calif-summary-card">
          <div
            className="calif-summary-icono"
            style={{ background: "#f0d5fc", color: "#B032E7" }}
          >
            <BarChart3 size={18} />
          </div>
          <div>
            <span className="calif-summary-label">Promedio general</span>
            <strong>{formatearPromedio(data.promedioGeneral)}</strong>
            {data.estadoGeneral && (
              <span
                className="calif-summary-sub"
                style={{ color: estadoColorTexto(data.estadoGeneral) }}
              >
                {data.estadoGeneral}
              </span>
            )}
          </div>
        </div>

        <div className="calif-summary-card">
          <div
            className="calif-summary-icono"
            style={{ background: "#dbeafe", color: "#2563eb" }}
          >
            <FontAwesomeIcon icon={faBookOpen} size="xl" />
          </div>
          <div>
            <span className="calif-summary-label">Asignaturas</span>
            <strong>{data.totalAsignaturas}</strong>
            <span className="calif-summary-sub">En curso</span>
          </div>
        </div>

        <div className="calif-summary-card">
          <div
            className="calif-summary-icono"
            style={{ background: "#dcfce7", color: "#16a34a" }}
          >
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="calif-summary-label">Actividades calificadas</span>
            <strong>{data.totalActividadesCalificadas}</strong>
            <span className="calif-summary-sub">Completadas</span>
          </div>
        </div>

        <div className="calif-summary-card">
          <div
            className="calif-summary-icono"
            style={{ background: "#ffedd5", color: "#ea580c" }}
          >
            <Clock size={18} />
          </div>
          <div>
            <span className="calif-summary-label">Pendientes de calificar</span>
            <strong>{data.totalPendientesCalificar}</strong>
            <span className="calif-summary-sub">Actividades</span>
          </div>
        </div>
      </div>

      <div className="calificaciones-filtros">
        <div className="filtro">
          <select
            className="filtro-select-cal"
            value={filtroAsignatura}
            onChange={(e) => setFiltroAsignatura(e.target.value)}
          >
            <option value="todas">Todas las asignaturas</option>
            {data.asignaturas.map((a) => (
              <option key={a.cursoAsignaturaId} value={a.cursoAsignaturaId}>
                {a.asignatura}
              </option>
            ))}
          </select>
        </div>
        <div className="filtro">
          <select className="filtro-select-cal" defaultValue="todos">
            <option value="todos">Todos los periodos</option>
          </select>
        </div>

        <div className="calif-exportar-col">
          <button
            className="btn-exportar-cal"
            onClick={(e) => {
              e.stopPropagation();
              setMostrarExportar((v) => !v);
            }}
          >
            <FontAwesomeIcon icon={faDownload} /> Exportar reporte
          </button>
          {mostrarExportar && (
            <div
              className="exportar-dropdown-cal-pf"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={exportarPDF}>
                <FontAwesomeIcon
                  icon={faFilePdf}
                  size="sm"
                  style={{ color: "red" }}
                />{" "}
                PDF
              </button>
              <button onClick={exportarExcel}>
                <FontAwesomeIcon
                  icon={faFileExcel}
                  style={{ color: "green" }}
                />{" "}
                Excel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="calif-tabla-wrapper">
        <table className="calif-tabla">
          <thead>
            <tr>
              <th>Asignatura</th>
              <th>Promedio</th>
              <th>Actividades calificadas</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {asignaturasFiltradas.map((a, i) => {
              const estilo = estilos[i % estilos.length];
              const icono = getIconoAsignatura(a.asignatura);
              return (
                <tr
                  key={a.cursoAsignaturaId}
                  onClick={() =>
                    navigate(`/alumno/calificaciones/${a.cursoAsignaturaId}`)
                  }
                >
                  <td>
                    <div className="calif-asignatura-col">
                      <div
                        className="calif-icono"
                        style={{ background: estilo.bg, color: estilo.color }}
                      >
                        <FontAwesomeIcon icon={icono} size="sm" />
                      </div>
                      <div>
                        <strong>{a.asignatura}</strong>
                        <span>{a.profesor}</span>
                      </div>
                    </div>
                  </td>
                  <td
                    className="calif-promedio"
                    style={{ color: a.estadoColor?.color ?? "#333" }}
                  >
                    {formatearPromedio(a.promedio)}
                  </td>
                  <td>
                    {a.actividadesCalificadas}/{a.totalActividades}
                  </td>
                  <td>
                    {a.estado && (
                      <span
                        className="estado-pill"
                        style={{
                          border: `1px solid ${a.estadoColor?.color}`,
                          color: a.estadoColor?.color,
                        }}
                      >
                        {a.estado}
                      </span>
                    )}
                  </td>
                  <td className="col-chevron">
                    <ChevronRight size={15} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function estadoColorTexto(estado: string) {
  const colores: Record<string, string> = {
    Excelente: "#B032E7",
    Bueno: "#16a34a",
    Aceptable: "#d97706",
    Insuficiente: "#dc2626",
  };
  return colores[estado] ?? "#666";
}

export default Calificaciones;
