import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, MoreVertical, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { getCentroActivo } from "../../utils/auth";
import "../../styles/admin/adminAlumnos.css";
import "../../styles/admin/adminActividad.css";
import { faFilePdf, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const API_URL = import.meta.env.VITE_API_URL;

interface Actividad {
  id: number;
  tipo: string;
  categoria: string;
  modulo: string;
  titulo: string;
  descripcion: string;
  ip: string | null;
  createdAt: string;
  usuario: string;
  fotoUrl: string | null;
  rol: string | null;
}

interface UsuarioOpcion {
  id: number;
  nombre: string;
}

const categoriaEstilo: Record<string, { bg: string; color: string }> = {
  Creacion: { bg: "#dcfce7", color: "#16a34a" },
  Actualizacion: { bg: "#dbeafe", color: "#2563eb" },
  Asignacion: { bg: "#ffedd5", color: "#ea580c" },
  Eliminacion: { bg: "#fee2e2", color: "#dc2626" },
  Publicacion: { bg: "#f3e8ff", color: "#9333ea" },
  Registro: { bg: "#e0f2fe", color: "#0284c7" },
  Seguridad: { bg: "#fef3c7", color: "#d97706" },
};

function ActividadRecienteAdmin() {
  const navigate = useNavigate();
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [usuariosOpciones, setUsuariosOpciones] = useState<UsuarioOpcion[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [fechaFin, setFechaFin] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [categoria, setCategoria] = useState("todos");
  const [usuarioFiltro, setUsuarioFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarExportar, setMostrarExportar] = useState(false);

  const cargar = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    const params = new URLSearchParams({
      centroId: String(centroActivo.id),
      fechaInicio,
      fechaFin,
      categoria,
      usuarioFiltro,
      busqueda,
      pagina: String(pagina),
    });
    try {
      const res = await fetch(`${API_URL}/api/admin/actividad?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Error al cargar la actividad");
      setActividades(data.actividades);
      setTotal(data.total);
      setTotalPaginas(data.totalPaginas);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar la actividad",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelado = false;

    const cargarActividades = async () => {
      setLoading(true);

      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();

      const params = new URLSearchParams({
        centroId: String(centroActivo.id),
        fechaInicio,
        fechaFin,
        categoria,
        usuarioFiltro,
        busqueda,
        pagina: String(pagina),
      });

      try {
        const res = await fetch(`${API_URL}/api/admin/actividad?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Error al cargar la actividad");
        }

        if (!cancelado) {
          setActividades(data.actividades);
          setTotal(data.total);
          setTotalPaginas(data.totalPaginas);
          setError("");
        }
      } catch (err) {
        if (!cancelado) {
          setError(
            err instanceof Error ? err.message : "Error al cargar la actividad",
          );
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    };

    cargarActividades();

    return () => {
      cancelado = true;
    };
  }, [fechaInicio, fechaFin, categoria, usuarioFiltro, busqueda, pagina]);
  useEffect(() => {
    const cargarUsuarios = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      const res = await fetch(
        `${API_URL}/api/admin/actividad/usuarios?centroId=${centroActivo.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) setUsuariosOpciones(data);
    };
    cargarUsuarios();
  }, []);

  useEffect(() => {
    const cerrar = () => setMostrarExportar(false);
    if (mostrarExportar) document.addEventListener("click", cerrar);
    return () => document.removeEventListener("click", cerrar);
  }, [mostrarExportar]);

  const handleBuscar = () => {
    setPagina(1);
    cargar();
  };

  const formatearFechaHora = (fecha: string) => {
    const d = new Date(fecha);
    return {
      fecha: d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      hora: d.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Historial de actividad", 14, 15);
    autoTable(doc, {
      startY: 22,
      head: [["Fecha", "Usuario", "Accion", "Modulo", "IP"]],
      body: actividades.map((a) => {
        const { fecha, hora } = formatearFechaHora(a.createdAt);
        return [`${fecha} ${hora}`, a.usuario, a.titulo, a.modulo, a.ip ?? "-"];
      }),
    });
    doc.save("actividad.pdf");
    setMostrarExportar(false);
  };

  const exportarExcel = () => {
    const filas = actividades.map((a) => {
      const { fecha, hora } = formatearFechaHora(a.createdAt);
      return {
        Fecha: fecha,
        Hora: hora,
        Usuario: a.usuario,
        Accion: a.titulo,
        Tipo: a.categoria,
        Detalle: a.descripcion,
        Modulo: a.modulo,
        IP: a.ip ?? "-",
      };
    });
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Actividad");
    XLSX.writeFile(libro, "actividad.xlsx");
    setMostrarExportar(false);
  };

  return (
    <div className="content admin-actividad-page">
      <div className="detalle-asig-breadcrumb">
        <span onClick={() => navigate("/admin")}>Inicio</span>
        <ChevronRight size={12} /> <strong>Actividad</strong>
      </div>
      <h1>Actividad reciente</h1>
      <p className="subtitle">
        Historial de las ultimas acciones realizadas en la plataforma.
      </p>

      <div className="admin-actividad-filtros">
        <div className="admin-actividad-fechas">
          <input
            type="date"
            className="modal-input"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
          <span>-</span>
          <input
            type="date"
            className="modal-input"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
        <div className="filtro-ad">
          <select
            className="filtro-select-ad"
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value);
              setPagina(1);
            }}
          >
            <option value="todos">Todos los tipos</option>
            {Object.keys(categoriaEstilo).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="filtro-ad">
          <select
            className="filtro-select-ad"
            value={usuarioFiltro}
            onChange={(e) => {
              setUsuarioFiltro(e.target.value);
              setPagina(1);
            }}
          >
            <option value="todos">Todos los usuarios</option>
            {usuariosOpciones.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
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

      <div className="admin-actividad-tabla-card">
        <div className="admin-actividad-header-tabla">
          <div>
            <h3>Historial de actividad</h3>
            <p>
              Mostrando 1 a {actividades.length} de {total} actividades
            </p>
          </div>
          <div className="buscador" style={{ width: 280 }}>
            <Search size={16} />
            <input
              placeholder="Buscar actividad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
            />
          </div>
        </div>

        {loading ? (
          <p style={{ padding: 20 }}>Cargando actividad...</p>
        ) : error ? (
          <p className="modal-error" style={{ padding: 20 }}>
            {error}
          </p>
        ) : (
          <table className="admin-alumnos-tabla">
            <thead>
              <tr>
                <th>Fecha y hora</th>
                <th>Usuario</th>
                <th>Accion</th>
                <th>Tipo</th>
                <th>Detalle</th>
                <th>Modulo</th>
                <th>IP</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {actividades.map((a) => {
                const { fecha, hora } = formatearFechaHora(a.createdAt);
                const estilo = categoriaEstilo[a.categoria] ?? {
                  bg: "#f3f4f6",
                  color: "#666",
                };
                return (
                  <tr key={a.id}>
                    <td>
                      <div>{fecha}</div>
                      <span style={{ fontSize: 11, color: "#999" }}>
                        {hora}
                      </span>
                    </td>
                    <td>
                      <div className="admin-alumno-col">
                        <div className="admin-alumno-avatar">
                          {a.fotoUrl ? (
                            <img src={a.fotoUrl} alt={a.usuario} />
                          ) : (
                            <span>{a.usuario[0]}</span>
                          )}
                        </div>
                        <div>
                          <div>{a.usuario}</div>
                          <span
                            style={{
                              fontSize: 11,
                              color: "#999",
                              textTransform: "capitalize",
                            }}
                          >
                            {a.rol ?? "-"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{a.titulo}</td>
                    <td>
                      <span
                        className="estado-pill"
                        style={{ background: estilo.bg, color: estilo.color }}
                      >
                        {a.categoria}
                      </span>
                    </td>
                    <td>{a.descripcion}</td>
                    <td>{a.modulo}</td>
                    <td>{a.ip ?? "-"}</td>
                    <td className="col-chevron">
                      <MoreVertical size={16} />
                    </td>
                  </tr>
                );
              })}
              {actividades.length === 0 && (
                <tr>
                  <td colSpan={8} className="material-vacio">
                    No hay actividad en el rango seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {total > 0 && (
          <div className="tareas-paginacion">
            <span>
              Mostrando {(pagina - 1) * 20 + 1} a {Math.min(pagina * 20, total)}{" "}
              de {total} actividades
            </span>
            <div className="paginacion-botones">
              <button
                disabled={pagina === 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
              >
                {"<"}
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                (n) => (
                  <button
                    key={n}
                    className={n === pagina ? "activo" : ""}
                    onClick={() => setPagina(n)}
                  >
                    {n}
                  </button>
                ),
              )}
              <button
                disabled={pagina === totalPaginas}
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              >
                {">"}
              </button>
            </div>
          </div>
        )}
    </div>
  );
}

export default ActividadRecienteAdmin;
