import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  Eye,
  Pencil,
  Trash2,
  GraduationCap,
  Users,
  UserCheck,
  Plus,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { getCentroActivo } from "../../utils/auth";
import ConfirmarEliminarModal from "../../components/ConfirmarEliminarModal";
import "../../styles/adminAlumnos.css";
import "../../styles/adminCursos.css";
import {
  faFileExcel,
  faFilePdf,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const API_URL = import.meta.env.VITE_API_URL;

interface Tutor {
  id: number;
  nombre: string;
  fotoUrl: string | null;
}

interface Curso {
  id: number;
  curso: string;
  nivel: string | null;
  totalAlumnos: number;
  totalAsignaturas: number;
  tutor: Tutor | null;
}

interface Totales {
  totalCursos: number;
  totalAlumnos: number;
  totalAsignaturas: number;
  totalProfesores: number;
}

const PAGE_SIZE = 10;

function CursosAdmin() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [totales, setTotales] = useState<Totales | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [mostrarExportar, setMostrarExportar] = useState(false);
  const [eliminarCurso, setEliminarCurso] = useState<Curso | null>(null);
  const navigate = useNavigate();

  const cargar = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    try {
      const res = await fetch(
        `${API_URL}/api/admin/cursos?centroId=${centroActivo.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al cargar cursos");
      setCursos(data.cursos ?? []);
      setTotales(data.totales ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar cursos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar, patron estandar
    cargar();
  }, []);

  useEffect(() => {
    const cerrar = () => setMostrarExportar(false);
    if (mostrarExportar) document.addEventListener("click", cerrar);
    return () => document.removeEventListener("click", cerrar);
  }, [mostrarExportar]);

  const nivelesUnicos = Array.from(
    new Set(cursos.filter((c) => c.nivel).map((c) => c.nivel)),
  ) as string[];

  const cursosFiltrados = cursos.filter((c) => {
    const coincideBusqueda = c.curso
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const coincideNivel = filtroNivel === "todos" || c.nivel === filtroNivel;
    return coincideBusqueda && coincideNivel;
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(cursosFiltrados.length / PAGE_SIZE),
  );
  const cursosPagina = cursosFiltrados.slice(
    (pagina - 1) * PAGE_SIZE,
    pagina * PAGE_SIZE,
  );

  const handleEliminar = async () => {
    if (!eliminarCurso) return;
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const res = await fetch(
      `${API_URL}/api/admin/cursos/${eliminarCurso.id}?centroId=${centroActivo.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al eliminar");
    cargar();
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Cursos", 14, 15);
    autoTable(doc, {
      startY: 22,
      head: [["Curso", "Nivel", "Alumnos", "Asignaturas", "Tutor"]],
      body: cursosFiltrados.map((c) => [
        c.curso,
        c.nivel ?? "-",
        String(c.totalAlumnos),
        String(c.totalAsignaturas),
        c.tutor?.nombre ?? "Sin asignar",
      ]),
    });
    doc.save("cursos.pdf");
    setMostrarExportar(false);
  };

  const exportarExcel = () => {
    const filas = cursosFiltrados.map((c) => ({
      Curso: c.curso,
      Nivel: c.nivel ?? "-",
      Alumnos: c.totalAlumnos,
      Asignaturas: c.totalAsignaturas,
      Tutor: c.tutor?.nombre ?? "Sin asignar",
    }));
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Cursos");
    XLSX.writeFile(libro, "cursos.xlsx");
    setMostrarExportar(false);
  };

  const getIniciales = (nombreCompleto: string) => {
    const partes = nombreCompleto.split(" ");
    return `${partes[0]?.[0] ?? ""}${partes[1]?.[0] ?? ""}`.toUpperCase();
  };

  if (loading) return <p>Cargando cursos...</p>;
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
        <div className="cursos-ad">
          <h1>Cursos</h1>
          <p>
            Gestiona todos los cursos del centro y las asignaturas que
            pertenecen a cada curso.
          </p>
        </div>
        <button className="btn-agregar-curso">
          <Plus size={16} /> Agregar curso
        </button>
      </div>

      <div className="admin-alumnos-filtros">
        <div className="buscador-ad">
          <Search size={18} />
          <input
            placeholder="Buscar curso..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
          />
        </div>
        <div className="filtro-ad">
          <select
            className="filtro-select-ad"
            value={filtroNivel}
            onChange={(e) => {
              setFiltroNivel(e.target.value);
              setPagina(1);
            }}
          >
            <option value="todos">Nivel: Todos</option>
            {nivelesUnicos.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="calif-exportar-col" style={{ marginLeft: "auto" }}>
          <button
            className="btn-exportar-cal"
            onClick={(e) => {
              e.stopPropagation();
              setMostrarExportar((v) => !v);
            }}
          >
            <Download size={14} /> Exportar
          </button>
          {mostrarExportar && (
            <div
              className="exportar-dropdown-cal-pf"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={exportarPDF} style={{ color: "red" }}>
                <FontAwesomeIcon icon={faFilePdf} size="sm" /> PDF
              </button>
              <button onClick={exportarExcel} style={{ color: "green" }}>
                <FontAwesomeIcon icon={faFileExcel} size="sm" />
                Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {totales && (
        <div className="admin-cursos-summary-grid">
          <div className="admin-summary-card">
            <div
              className="admin-summary-icono"
              style={{ background: "#fee2e2", color: "#dc2626" }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <span>Total de cursos</span>
              <strong>{totales.totalCursos}</strong>
              <span className="admin-summary-sub">En todos los niveles</span>
            </div>
          </div>
          <div className="admin-summary-card">
            <div
              className="admin-summary-icono"
              style={{ background: "#dbeafe", color: "#2563eb" }}
            >
              <Users size={22} />
            </div>
            <div>
              <span>Total de alumnos</span>
              <strong>{totales.totalAlumnos}</strong>
              <span className="admin-summary-sub">Matriculados en cursos</span>
            </div>
          </div>
          <div className="admin-summary-card">
            <div
              className="admin-summary-icono"
              style={{ background: "#dcfce7", color: "#16a34a" }}
            >
              <FontAwesomeIcon icon={faBookOpen} size="2x" />
            </div>
            <div>
              <span>Total de asignaturas</span>
              <strong>{totales.totalAsignaturas}</strong>
              <span className="admin-summary-sub">En todos los cursos</span>
            </div>
          </div>
          <div className="admin-summary-card">
            <div
              className="admin-summary-icono"
              style={{ background: "#ffedd5", color: "#ea580c" }}
            >
              <UserCheck size={22} />
            </div>
            <div>
              <span>Total de profesores</span>
              <strong>{totales.totalProfesores}</strong>
              <span className="admin-summary-sub">Asignados a cursos</span>
            </div>
          </div>
        </div>
      )}

      <div className="admin-alumnos-tabla-wrapper">
        <table className="admin-alumnos-tabla">
          <thead>
            <tr>
              <th>#</th>
              <th>Curso</th>
              <th>Nivel</th>
              <th>Alumnos</th>
              <th>Asignaturas</th>
              <th>Tutor / Responsable</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cursosPagina.map((c, i) => (
              <tr key={c.id}>
                <td>{(pagina - 1) * PAGE_SIZE + i + 1}</td>
                <td>
                  <strong>{c.curso}</strong>
                </td>
                <td>
                  {c.nivel && (
                    <span className="admin-badge admin-badge-azul">
                      {c.nivel}
                    </span>
                  )}
                </td>
                <td>{c.totalAlumnos}</td>
                <td>{c.totalAsignaturas}</td>
                <td>
                  {c.tutor ? (
                    <div className="admin-alumno-col">
                      <div className="admin-alumno-avatar">
                        {c.tutor.fotoUrl ? (
                          <img src={c.tutor.fotoUrl} alt={c.tutor.nombre} />
                        ) : (
                          <span>{getIniciales(c.tutor.nombre)}</span>
                        )}
                      </div>
                      <span>{c.tutor.nombre}</span>
                    </div>
                  ) : (
                    <span className="admin-badge-vacio">Sin asignar</span>
                  )}
                </td>
                <td>
                  <div className="admin-acciones">
                    <button
                      className="admin-accion-btn ver"
                      onClick={() => navigate(`/admin/cursos/${c.id}`)}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="admin-accion-btn editar"
                      onClick={() => navigate(`/admin/cursos/${c.id}?editar=1`)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="admin-accion-btn eliminar"
                      onClick={() => setEliminarCurso(c)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {cursosPagina.length === 0 && (
              <tr>
                <td colSpan={7} className="material-vacio">
                  No se encontraron cursos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {cursosFiltrados.length > 0 && (
        <div className="tareas-paginacion">
          <span>
            Mostrando {(pagina - 1) * PAGE_SIZE + 1} a{" "}
            {Math.min(pagina * PAGE_SIZE, cursosFiltrados.length)} de{" "}
            {cursosFiltrados.length} cursos
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
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            >
              {">"}
            </button>
          </div>
        </div>
      )}
      {eliminarCurso && (
        <ConfirmarEliminarModal
          titulo="Eliminar curso"
          mensaje={`¿Seguro que quieres eliminar el curso "${eliminarCurso.curso}"?`}
          onClose={() => setEliminarCurso(null)}
          onConfirmar={handleEliminar}
        />
      )}
    </div>
  );
}

export default CursosAdmin;
