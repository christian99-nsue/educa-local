import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { Search, Download, Eye, Pencil, Trash2, Plus } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { getCentroActivo } from "../../utils/auth";
import ConfirmarEliminarModal from "../../components/ConfirmarEliminarModal";
import AnadirProfesorModal, {
  type ProfesorCreado,
} from "../../components/AnadirProfesorModal";
import "../../styles/adminAlumnos.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Profesor {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  codigo: string | null;
  fotoUrl: string | null;
  asignaturas: string[];
  cursos: string[];
  cursosIds: number[];
  niveles: string[];
}

const PAGE_SIZE = 10;

function ProfesoresAdmin() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("todos");
  const [filtroCurso, setFiltroCurso] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [mostrarExportar, setMostrarExportar] = useState(false);
  const [eliminarProfesor, setEliminarProfesor] = useState<Profesor | null>(
    null,
  );
  const [modalAnadirAbierto, setModalAnadirAbierto] = useState(false);
  const [profesoresCreadosSesion, setProfesoresCreadosSesion] = useState<
    ProfesorCreado[]
  >([]);
  const navigate = useNavigate();

  const cargar = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    try {
      const res = await fetch(
        `${API_URL}/api/admin/profesores?centroId=${centroActivo.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al cargar profesores");
      setProfesores(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar profesores",
      );
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
    new Set(profesores.flatMap((p) => p.niveles)),
  );

  const cursosUnicos = Array.from(
    new Set(
      profesores
        .filter(
          (p) => filtroNivel === "todos" || p.niveles.includes(filtroNivel),
        )
        .flatMap((p) => p.cursos),
    ),
  );

  const handleCambiarNivel = (nivel: string) => {
    setFiltroNivel(nivel);
    setFiltroCurso("todos");
    setPagina(1);
  };

  const profesoresFiltrados = profesores.filter((p) => {
    const nombreCompleto = `${p.nombre} ${p.apellidos ?? ""}`.toLowerCase();
    const coincideBusqueda =
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      p.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.codigo ?? "").toLowerCase().includes(busqueda.toLowerCase());
    const coincideNivel =
      filtroNivel === "todos" || p.niveles.includes(filtroNivel);
    const coincideCurso =
      filtroCurso === "todos" || p.cursos.includes(filtroCurso);
    return coincideBusqueda && coincideNivel && coincideCurso;
  });

  const handleProfesorCreado = (profesor: ProfesorCreado) => {
    setProfesoresCreadosSesion((prev) => [...prev, profesor]);
    cargar();
  };

  const totalPaginas = Math.max(
    1,
    Math.ceil(profesoresFiltrados.length / PAGE_SIZE),
  );
  const profesoresPagina = profesoresFiltrados.slice(
    (pagina - 1) * PAGE_SIZE,
    pagina * PAGE_SIZE,
  );

  const handleEliminar = async () => {
    if (!eliminarProfesor) return;
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const res = await fetch(
      `${API_URL}/api/admin/profesores/${eliminarProfesor.id}?centroId=${centroActivo.id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al eliminar");
    cargar();
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Profesores", 14, 15);
    autoTable(doc, {
      startY: 22,
      head: [["Profesor", "Codigo", "Asignaturas", "Cursos", "Correo"]],
      body: profesoresFiltrados.map((p) => [
        `${p.nombre} ${p.apellidos ?? ""}`,
        p.codigo ?? "-",
        p.asignaturas.join(", ") || "-",
        p.cursos.join(", ") || "-",
        p.email,
      ]),
    });
    doc.save("profesores.pdf");
    setMostrarExportar(false);
  };

  const exportarExcel = () => {
    const filas = profesoresFiltrados.map((p) => ({
      Profesor: `${p.nombre} ${p.apellidos ?? ""}`,
      Codigo: p.codigo ?? "-",
      Asignaturas: p.asignaturas.join(", ") || "-",
      Cursos: p.cursos.join(", ") || "-",
      Correo: p.email,
    }));
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Profesores");
    XLSX.writeFile(libro, "profesores.xlsx");
    setMostrarExportar(false);
  };

  const exportarCredencialesPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Credenciales de acceso - Profesores nuevos", 14, 15);
    autoTable(doc, {
      startY: 22,
      head: [["Nombre", "Codigo", "Asignaturas", "Contraseña"]],
      body: profesoresCreadosSesion.map((p) => [
        `${p.nombre} ${p.apellidos ?? ""}`,
        p.codigo,
        p.asignaturas,
        p.password ?? "(ya tenia cuenta)",
      ]),
    });
    doc.save("credenciales_profesores.pdf");
  };

  const exportarCredencialesExcel = () => {
    const filas = profesoresCreadosSesion.map((p) => ({
      Nombre: `${p.nombre} ${p.apellidos ?? ""}`,
      Codigo: p.codigo,
      Asignaturas: p.asignaturas,
      Contraseña: p.password ?? "(ya tenia cuenta)",
    }));
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Credenciales");
    XLSX.writeFile(libro, "credenciales_profesores.xlsx");
  };

  const getIniciales = (nombre: string, apellidos: string) =>
    `${nombre[0] ?? ""}${apellidos?.[0] ?? ""}`.toUpperCase();

  const renderBadges = (items: string[], colorClass: string) => {
    if (items.length === 0) return <span className="admin-badge-vacio">-</span>;
    const visibles = items.slice(0, 2);
    const restantes = items.length - visibles.length;
    return (
      <div className="admin-badges-wrapper">
        {visibles.map((item) => (
          <span key={item} className={`admin-badge ${colorClass}`}>
            {item}
          </span>
        ))}
        {restantes > 0 && (
          <span className="admin-badge admin-badge-mas">+{restantes}</span>
        )}
      </div>
    );
  };

  if (loading) return <p>Cargando profesores...</p>;
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
          <h1>Profesores</h1>
          <p>Gestiona todos los profesores que forman parte del centro.</p>
        </div>
        <button
          className="btn-agregar-curso"
          onClick={() => setModalAnadirAbierto(true)}
        >
          <Plus size={16} /> Agregar profesor
        </button>
      </div>

      {profesoresCreadosSesion.length > 0 && (
        <div
          className="modal-aviso-entregas"
          style={{ background: "#dcfce7", color: "#166534", marginBottom: 16 }}
        >
          Has añadido {profesoresCreadosSesion.length} profesor(s) en esta
          sesion.{" "}
          <span
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={exportarCredencialesPDF}
          >
            Exportar credenciales (PDF)
          </span>{" "}
          ·{" "}
          <span
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={exportarCredencialesExcel}
          >
            Exportar (Excel)
          </span>
        </div>
      )}

      <div className="admin-alumnos-filtros">
        <div className="buscador-ad">
          <Search size={18} />
          <input
            placeholder="Buscar profesor por nombre, correo o codigo..."
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
            onChange={(e) => handleCambiarNivel(e.target.value)}
          >
            <option value="todos">Todos los niveles</option>
            {nivelesUnicos.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="filtro-ad">
          <select
            className="filtro-select-ad"
            value={filtroCurso}
            onChange={(e) => {
              setFiltroCurso(e.target.value);
              setPagina(1);
            }}
          >
            <option value="todos">Todos los cursos</option>
            {cursosUnicos.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
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

      <div className="admin-alumnos-tabla-wrapper">
        <table className="admin-alumnos-tabla">
          <thead>
            <tr>
              <th>#</th>
              <th>Profesor</th>
              <th>Codigo</th>
              <th>Asignaturas que imparte</th>
              <th>Cursos</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {profesoresPagina.map((p, i) => (
              <tr key={p.id}>
                <td>{(pagina - 1) * PAGE_SIZE + i + 1}</td>
                <td>
                  <div className="admin-alumno-col">
                    <div className="admin-alumno-avatar">
                      {p.fotoUrl ? (
                        <img src={p.fotoUrl} alt={p.nombre} />
                      ) : (
                        <span>{getIniciales(p.nombre, p.apellidos)}</span>
                      )}
                    </div>
                    <span>
                      {p.nombre} {p.apellidos}
                    </span>
                  </div>
                </td>
                <td>{p.codigo ?? "-"}</td>
                <td>{renderBadges(p.asignaturas, "admin-badge-azul")}</td>
                <td>{renderBadges(p.cursos, "admin-badge-verde")}</td>
                <td>{p.email}</td>
                <td>
                  <div className="admin-acciones">
                    <button
                      className="admin-accion-btn ver"
                      onClick={() => navigate(`/admin/profesores/${p.id}`)}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="admin-accion-btn editar"
                      onClick={() =>
                        navigate(`/admin/profesores/${p.id}?editar=1`)
                      }
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="admin-accion-btn eliminar"
                      onClick={() => setEliminarProfesor(p)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {profesoresPagina.length === 0 && (
              <tr>
                <td colSpan={7} className="material-vacio">
                  No se encontraron profesores.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {profesoresFiltrados.length > 0 && (
        <div className="tareas-paginacion">
          <span>
            Mostrando {(pagina - 1) * PAGE_SIZE + 1} a{" "}
            {Math.min(pagina * PAGE_SIZE, profesoresFiltrados.length)} de{" "}
            {profesoresFiltrados.length} profesores
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
      {eliminarProfesor && (
        <ConfirmarEliminarModal
          titulo="Eliminar profesor"
          mensaje={`¿Seguro que quieres eliminar a ${eliminarProfesor.nombre} ${eliminarProfesor.apellidos ?? ""} del centro?`}
          onClose={() => setEliminarProfesor(null)}
          onConfirmar={handleEliminar}
        />
      )}

      {modalAnadirAbierto && (
        <AnadirProfesorModal
          onClose={() => setModalAnadirAbierto(false)}
          onCreado={handleProfesorCreado}
        />
      )}
    </div>
  );
}

export default ProfesoresAdmin;
