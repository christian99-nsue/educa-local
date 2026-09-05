import { getUser, getCentroActivo } from "../../utils/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  Layers,
  Clock,
  UserPlus,
  BookOpen,
  FileText,
  ArrowRight,
  Calendar,
  UserMinus,
  type LucideIcon,
} from "lucide-react";
import "../../styles/admin/dashboardAdmin.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Actividad {
  tipo: string;
  icono: string;
  titulo: string;
  descripcion: string;
  createdAt: string;
}

interface DashboardData {
  centro: string;
  totalAlumnos: number;
  totalProfesores: number;
  totalCursos: number;
  horariosActivos: number;
  actividadReciente: Actividad[];
}

const iconoPorTipo: Record<
  string,
  { Icon: LucideIcon; bg: string; color: string }
> = {
  alumno_registrado: { Icon: UserPlus, bg: "#dcfce7", color: "#16a34a" },
  profesor_registrado: { Icon: UserCheck, bg: "#f3e8ff", color: "#9333ea" },
  asignatura_creada: { Icon: BookOpen, bg: "#dbeafe", color: "#2563eb" },
  tarea_publicada: { Icon: FileText, bg: "#fef3c7", color: "#d97706" },
  alumno_removido: { Icon: UserMinus, bg: "#fee2e2", color: "#dc2626" },
  curso_creado: { Icon: Layers, bg: "#dbeafe", color: "#2563eb" },
  curso_editado: { Icon: Layers, bg: "#fef3c7", color: "#d97706" },
  asignatura_editada: { Icon: BookOpen, bg: "#fef3c7", color: "#d97706" },
  profesor_removido: { Icon: UserMinus, bg: "#fee2e2", color: "#dc2626" },
  tarea_calificada: { Icon: FileText, bg: "#dbeafe", color: "#2563eb" },
  tarea_entregada: { Icon: FileText, bg: "#dbeafe", color: "#2563eb" },
};

const InicioAdmin = () => {
  const user = getUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();

      try {
        const res = await fetch(
          `${API_URL}/api/admin/dashboard?centroId=${centroActivo.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const json = await res.json();
        if (!res.ok)
          throw new Error(json?.error || "Error al cargar el dashboard");
        setData(json);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "error al cargar el dashboard",
        );
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const tiempoRelativo = (fecha: string | undefined | null) => {
    if (!fecha) return "Sin fecha";

    const fechaEvento = new Date(fecha);

    if (isNaN(fechaEvento.getTime())) {
      console.error("Fecha invalida:", fecha);
      return "Fecha invalida";
    }
    const ahora = new Date();

    const hora = fechaEvento.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const esMismoDia =
      fechaEvento.getDate() === ahora.getDate() &&
      fechaEvento.getMonth() === ahora.getMonth() &&
      fechaEvento.getFullYear() === ahora.getFullYear();

    if (esMismoDia) {
      return hora;
    }

    const ayer = new Date(ahora);
    ayer.setDate(ahora.getDate() - 1);
    const esAyer =
      fechaEvento.getDate() === ayer.getDate() &&
      fechaEvento.getMonth() === ayer.getMonth() &&
      fechaEvento.getFullYear() === ayer.getFullYear();

    if (esAyer) {
      return `Ayer, ${hora}`;
    }

    const fechaCorta = fechaEvento.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });

    return `${fechaCorta}, ${hora}`;
  };

  if (loading) return <p>Cargando...</p>;
  if (error || !data) {
    return (
      <div className="content">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="content inicio-admin-page">
      <h1>Inicio</h1>
      <p className="subtitle">
        Hola, {user?.nombre}
        <br />
        Resumen del {data.centro} de hoy
      </p>

      <div className="admin-summary-grid">
        <div className="admin-summary-card">
          <div
            className="admin-summary-icono"
            style={{ background: "#fee2e2", color: "#dc2626" }}
          >
            <Users size={22} />
          </div>
          <div>
            <span>Total Alumnos</span>
            <strong>{data.totalAlumnos}</strong>
            <a onClick={() => navigate("/admin/alumnos")}>
              Ver todos <ArrowRight size={12} />{" "}
            </a>
          </div>
        </div>
        <div className="admin-summary-card">
          <div
            className="admin-summary-icono"
            style={{ background: "#dbeafe", color: "#2563eb" }}
          >
            <UserCheck size={22} />
          </div>
          <div>
            <span>Total Profesores</span>
            <strong>{data.totalProfesores}</strong>
            <a onClick={() => navigate("/admin/profesores")}>
              Ver todos <ArrowRight size={12} />{" "}
            </a>
          </div>
        </div>
        <div className="admin-summary-card">
          <div
            className="admin-summary-icono"
            style={{ background: "#dcfce7", color: "#16a34a" }}
          >
            <Layers size={22} />
          </div>
          <div>
            <span>Total Cursos</span>
            <strong>{data.totalCursos}</strong>
            <a onClick={() => navigate("/admin/cursos")}>
              Ver todos <ArrowRight size={12} />{" "}
            </a>
          </div>
        </div>
        <div className="admin-summary-card">
          <div
            className="admin-summary-icono"
            style={{ background: "#fef3c7", color: "#d97706" }}
          >
            <Calendar size={22} />
          </div>
          <div>
            <span>Horarios Activos</span>
            <strong>{data.horariosActivos}</strong>
            <a onClick={() => navigate("/admin/horarios")}>
              Ver todos <ArrowRight size={12} />{" "}
            </a>
          </div>
        </div>
      </div>
      <div className="admin-actividad-card">
        <div className="admin-actividad-header">
          <h3>
            <Clock size={16} /> Actividad reciente
          </h3>
          <a onClick={() => navigate("/admin/actividad")}>Ver todas</a>
        </div>

        {data.actividadReciente.length === 0 ? (
          <p className="material-vacio">No hay actividad reciente.</p>
        ) : (
          data.actividadReciente.map((a, i) => {
            const { Icon, bg, color } =
              iconoPorTipo[a.tipo] ?? iconoPorTipo.alumno_registrado;
            return (
              <div key={i} className="admin-actividad-item">
                <div
                  className="admin-actividad-icono"
                  style={{ background: bg, color }}
                >
                  <Icon size={16} />
                </div>
                <div className="admin-actividad-info">
                  <strong>{a.titulo}</strong>
                  <span>{a.descripcion}</span>
                </div>
                <span className="admin-actividad-hora">
                  {tiempoRelativo(a.createdAt)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InicioAdmin;
