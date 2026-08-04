import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { Search, Download, Eye, Pencil, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { getCentroActivo } from "../../utils/auth";
import ConfirmarEliminarModal from "../../components/ConfirmarEliminarModal";
import "../../styles/adminAlumnos.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Alumno {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  codigo: string | null;
  fotoUrl: string | null;
  cursoId: number | null;
  curso: string | null;
  ramaId: number | null;
  rama: string | null;
  nivel: string | null;
}

const PAGE_SIZE = 10;

function AlumnosAdmin() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("todos");
  const [filtroNivel, setFiltroNivel] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [mostrarExportar, setMostrarExportar] = useState(false);
  const [eliminarAlumno, setEliminarAlumno] = useState<Alumno | null>(null);
  const navigate = useNavigate();

  const cargar = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    try {
      const res = await fetch(
        `${API_URL}/api/admin/alumnos?centroId=${centroActivo.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al cargar alumnos");
      setAlumnos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar alumnos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar, patron estandar
    cargar();
  }, []);

  useEffect(() => {
    const cerrar = () => setMostrarExportar(false);
    if (mostrarExportar) document.addEventListener("click", cerrar);
    return () => document.removeEventListener("click", cerrar);
  }, [mostrarExportar]);

  const nivelesUnicos = Array.from(
    new Set(alumnos.filter((a) => a.nivel).map((a) => a.nivel)),
  ) as string[];

  const cursosUnicos = Array.from(
    new Map(
      alumnos
        .filter(
          (a) =>
            a.cursoId && (filtroNivel === "todos" || a.nivel === filtroNivel),
        )
        .map((a) => [a.cursoId, a.curso]),
    ).entries(),
  );

  const alumnosFiltrados = alumnos.filter((a) => {
    const nombreCompleto = `${a.nombre} ${a.apellidos ?? ""}`.toLowerCase();
    const coincideBusqueda =
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      a.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (a.codigo ?? "").toLowerCase().includes(busqueda.toLowerCase());
    const coincideNivel = filtroNivel === "todos" || a.nivel === filtroNivel;
    const coincideCurso =
      filtroCurso === "todos" || String(a.cursoId) === filtroCurso;
    return coincideBusqueda && coincideNivel && coincideCurso;
  });

  const handleCambiarNivel = (nivel: string) => {
    setFiltroNivel(nivel);
    setFiltroCurso("todos");
    setPagina(1);
  };

  const totalPaginas = Math.max(
    1,
    Math.ceil(alumnosFiltrados.length / PAGE_SIZE),
  );
  const alumnosPagina = alumnosFiltrados.slice(
    (pagina - 1) * PAGE_SIZE,
    pagina * PAGE_SIZE,
  );

  const handleEliminar = async () => {
    if (!eliminarAlumno) return;
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const res = await fetch(
      `${API_URL}/api/admin/alumnos/${eliminarAlumno.id}?centroId=${centroActivo.id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al eliminar");
    cargar();
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Alumnos", 14, 15);
    autoTable(doc, {
      startY: 22,
      head: [["Alumno", "Codigo", "Curso", "Correo"]],
      body: alumnosFiltrados.map((a) => [
        `${a.nombre} ${a.apellidos ?? ""}`,
        a.codigo ?? "-",
        `${a.curso ?? "-"}${a.rama ? " " + a.rama : ""}`,
        a.email,
      ]),
    });
    doc.save("alumnos.pdf");
    setMostrarExportar(false);
  };

  const exportarExcel = () => {
    const filas = alumnosFiltrados.map((a) => ({
      Alumno: `${a.nombre} ${a.apellidos ?? ""}`,
      Codigo: a.codigo ?? "-",
      Curso: `${a.curso ?? "-"}${a.rama ? " " + a.rama : ""}`,
      Correo: a.email,
    }));
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Alumnos");
    XLSX.writeFile(libro, "alumnos.xlsx");
    setMostrarExportar(false);
  };

  const getIniciales = (nombre: string, apellidos: string) =>
    `${nombre[0] ?? ""}${apellidos?.[0] ?? ""}`.toUpperCase();

  if (loading) return <p>Cargando alumnos...</p>;
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
          <h1>Alumnos</h1>
          <p>Gestiona todos los alumnos registrados en el centro.</p>
        </div>
      </div>

      <div className="admin-alumnos-filtros">
        <div className="buscador-ad">
          <Search size={18} />
          <input
            placeholder="Buscar alumnos por nombre, correo o codigo..."
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
            {nivelesUnicos.map((nivel) => (
              <option key={nivel} value={nivel}>
                {nivel}
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
            {cursosUnicos.map(([id, nombre]) => (
              <option key={id ?? "sin-curso"} value={id ?? ""}>
                {nombre}
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
              <th>Alumno</th>
              <th>Codigo</th>
              <th>Curso</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alumnosPagina.map((a, i) => (
              <tr key={a.id}>
                <td>{(pagina - 1) * PAGE_SIZE + i + 1}</td>
                <td>
                  <div className="admin-alumno-col">
                    <div className="admin-alumno-avatar">
                      {a.fotoUrl ? (
                        <img src={a.fotoUrl} alt={a.nombre} />
                      ) : (
                        <span>{getIniciales(a.nombre, a.apellidos)}</span>
                      )}
                    </div>
                    <span>
                      {a.nombre} {a.apellidos}
                    </span>
                  </div>
                </td>
                <td>{a.codigo ?? "-"}</td>
                <td>
                  {a.curso ?? "-"}
                  {a.rama && (
                    <span className="admin-alumno-rama"> {a.rama}</span>
                  )}
                </td>
                <td>{a.email}</td>
                <td>
                  <div className="admin-acciones">
                    <button
                      className="admin-accion-btn ver"
                      onClick={() => navigate(`/admin/alumnos/${a.id}`)}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="admin-accion-btn editar"
                      onClick={() =>
                        navigate(`/admin/alumnos/${a.id}?editar=1`)
                      }
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="admin-accion-btn eliminar"
                      onClick={() => setEliminarAlumno(a)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {alumnosPagina.length === 0 && (
              <tr>
                <td colSpan={6} className="material-vacio">
                  No se encontraron alumnos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {alumnosFiltrados.length > 0 && (
        <div className="tareas-paginacion">
          <span>
            Mostrando {(pagina - 1) * PAGE_SIZE + 1} a{" "}
            {Math.min(pagina * PAGE_SIZE, alumnosFiltrados.length)} de{" "}
            {alumnosFiltrados.length} alumnos
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

      {eliminarAlumno && (
        <ConfirmarEliminarModal
          titulo="Eliminar alumno"
          mensaje={`¿Seguro que quieres eliminar a ${eliminarAlumno.nombre} ${eliminarAlumno.apellidos ?? ""} del centro?`}
          onClose={() => setEliminarAlumno(null)}
          onConfirmar={handleEliminar}
        />
      )}
    </div>
  );
}

export default AlumnosAdmin;
