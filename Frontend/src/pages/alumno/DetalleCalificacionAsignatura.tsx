import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCentroActivo } from "../../utils/auth";
import { getIconoAsignatura } from "../../utils/asignaturaIconos";
import { ChevronRight } from "lucide-react";
import "../../styles/alumno/detalleCalificacionAsignatura.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Actividad {
  id: number;
  titulo: string;
  fechaEntrega: string;
  puntos: number | null;
  tuPuntuacion: string;
  calificacionTexto: string;
  color: { bg: string; color: string } | null;
}

interface DetalleCalificacion {
  asignaturaId: number;
  asignatura: string;
  rama: string | null;
  profesor: string;
  sistemaCalificacion: "sobre-10" | "sobre-100" | "A-F";
  puntosMaximos: number | null;
  promedio: string | null;
  estadoGeneral: string | null;
  colorGeneral: { bg: string; color: string } | null;
  totalActividades: number;
  actividadesEvaluadas: number;
  actividades: Actividad[];
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

const escalaPorSistema: Record<
  string,
  { rango: string; texto: string; color: string }[]
> = {
  "sobre-10": [
    { rango: "9.0 - 10", texto: "Excelente", color: "#B032E7" },
    { rango: "7.0 - 8.9", texto: "Bueno", color: "#16a34a" },
    { rango: "5.0 - 6.9", texto: "Aceptable", color: "#d97706" },
    { rango: "0 - 4.9", texto: "Insuficiente", color: "#dc2626" },
  ],
  "sobre-100": [
    { rango: "90 - 100", texto: "Excelente", color: "#B032E7" },
    { rango: "70 - 89", texto: "Bueno", color: "#16a34a" },
    { rango: "50 - 69", texto: "Aceptable", color: "#d97706" },
    { rango: "0 - 49", texto: "Insuficiente", color: "#dc2626" },
  ],
  "A-F": [
    { rango: "A", texto: "Excelente", color: "#B032E7" },
    { rango: "B", texto: "Bueno", color: "#16a34a" },
    { rango: "C", texto: "Aceptable", color: "#d97706" },
    { rango: "D - F", texto: "Insuficiente", color: "#dc2626" },
  ],
};

function DetalleCalificacionAsignatura() {
  const { cursoAsignaturaId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<DetalleCalificacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          `${API_URL}/api/alumno/calificaciones/asignatura/${cursoAsignaturaId}/detalle?centroId=${centroActivo.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const json = await res.json();
        if (!res.ok)
          throw new Error(json?.error || "Error al cargar la calificacion");
        setData(json);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar la calificacion",
        );
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [cursoAsignaturaId]);

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  if (loading) return <p>Cargando calificacion...</p>;
  if (error || !data) {
    return (
      <div className="content">
        <p>{error}</p>
      </div>
    );
  }

  const estilo = estilos[data.asignaturaId % estilos.length];
  const escala = escalaPorSistema[data.sistemaCalificacion];
  const sufijo =
    data.sistemaCalificacion === "A-F" ? "" : ` / ${data.puntosMaximos}`;

  return (
    <div className="content detalle-calif-page">
      <div className="detalle-asig-breadcrumb">
        <span onClick={() => navigate("/alumno/calificaciones")}>
          Calificaciones
        </span>{" "}
        <ChevronRight size={12} /> <strong>{data.asignatura}</strong>
      </div>

      <div className="detalle-calif-header">
        <div
          className="detalle-calif-header-izq"
          style={{ borderLeft: `7px solid ${estilo.bg}` }}
        >
          <div
            className="detalle-calif-icono"
            style={{ background: estilo.bg, color: estilo.color }}
          >
            <FontAwesomeIcon
              icon={getIconoAsignatura(data.asignatura)}
              size="2x"
            />
          </div>
          <div>
            <h1>{data.asignatura}</h1>
            <p>{data.profesor}</p>
            <p>Rama: {data.rama ? data.rama : "-"}</p>
          </div>
        </div>

        <div
          className="detalle-calif-promedio-box"
          style={{ background: data.colorGeneral?.bg ?? "#f3f4f6" }}
        >
          <span>Promedio de la asignatura</span>
          <strong style={{ color: data.colorGeneral?.color ?? "#333" }}>
            {data.promedio ?? "-"}
            {sufijo}
          </strong>
          {data.estadoGeneral && (
            <span
              className="detalle-calif-estado-texto"
              style={{ color: data.colorGeneral?.color }}
            >
              ☆ {data.estadoGeneral}
            </span>
          )}
        </div>
      </div>

      <div className="detalle-calif-layout">
        <div className="detalle-calif-card">
          <h3>Actividades evaluadas</h3>
          <table className="detalle-calif-tabla">
            <thead>
              <tr>
                <th>Actividad</th>
                <th>Fecha de entrega</th>
                <th>Puntos</th>
                <th>Tu puntuacion</th>
                <th>Calificacion</th>
              </tr>
            </thead>
            <tbody>
              {data.actividades.map((act) => (
                <tr
                  key={act.id}
                  onClick={() => navigate(`/alumno/tareas/${act.id}`)}
                  className="detalle-calif-tr"
                >
                  <td>
                    <strong>{act.titulo}</strong>
                  </td>
                  <td>{formatearFecha(act.fechaEntrega)}</td>
                  <td>{act.puntos ?? "-"}</td>
                  <td style={{ color: act.color?.color, fontWeight: 700 }}>
                    {act.tuPuntuacion}
                  </td>
                  <td className="calif-pill-td">
                    <span
                      className="calif-pill"
                      style={{
                        background: act.color?.bg,
                        color: act.color?.color,
                      }}
                    >
                      {act.calificacionTexto}
                      {sufijo}
                    </span>
                  </td>
                </tr>
              ))}
              {data.actividades.length === 0 && (
                <tr>
                  <td colSpan={5} className="material-vacio">
                    No hay actividades evaluadas todavia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="detalle-calif-col-der">
          <div className="detalle-calif-card">
            <h3>Resumen de calificaciones</h3>
            <div className="detalle-calif-info-row">
              <span>Actividades evaluadas</span>
              <strong>
                {data.actividadesEvaluadas} / {data.totalActividades}
              </strong>
            </div>
            <div className="detalle-calif-info-row">
              <span>Promedio de la asignatura</span>
              <strong>
                {data.promedio ?? "-"}
                {sufijo}
              </strong>
            </div>
            <div className="detalle-calif-info-row">
              <span>Nivel</span>
              <strong>{data.estadoGeneral ?? "-"}</strong>
            </div>
          </div>

          <div className="detalle-calif-card">
            <h3>Escala de calificacion</h3>
            {escala.map((e) => (
              <div key={e.texto} className="detalle-calif-escala-row">
                <span>{e.rango}</span>
                <strong style={{ color: e.color }}>{e.texto}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleCalificacionAsignatura;
