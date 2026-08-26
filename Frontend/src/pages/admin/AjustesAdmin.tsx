import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { getCentroActivo } from "../../utils/auth";
import avatarDefault from "../../assets/images/avatar-default.png";
import logoCentro from "../../assets/images/instituto.png";
import "../../styles/admin/adminAjustes.css";

const API_URL = import.meta.env.VITE_API_URL;

interface CentroData {
  nombre: string;
  codigo: string | null;
  email: string | null;
  sitioWeb: string | null;
  telefono: string | null;
  direccion: string | null;
  director: string | null;
  logoUrl: string | null;
  anoAcademico: string | null;
  inicioAnoAcademico: string | null;
}

interface AdminData {
  nombre: string;
  apellidos: string;
  codigo: string | null;
  telefono: string | null;
  email: string;
  fotoUrl: string | null;
}

function AjustesAdmin() {
  const [centro, setCentro] = useState<CentroData | null>(null);
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exitoCentro, setExitoCentro] = useState("");
  const [exitoAdmin, setExitoAdmin] = useState("");
  const [guardandoCentro, setGuardandoCentro] = useState(false);
  const [guardandoAdmin, setGuardandoAdmin] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoArchivo, setLogoArchivo] = useState<File | null>(null);
  const inputLogoRef = useRef<HTMLInputElement>(null);
  const [fotoAdminPreview, setFotoAdminPreview] = useState<string | null>(null);
  const [fotoAdminArchivo, setFotoAdminArchivo] = useState<File | null>(null);
  const inputFotoAdminRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      try {
        const res = await fetch(
          `${API_URL}/api/admin/ajustes?centroId=${centroActivo.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || "Error al cargar los ajustes");
        setCentro(data.centro);
        setAdmin(data.admin);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar los ajustes",
        );
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoArchivo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFotoAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoAdminArchivo(file);
      setFotoAdminPreview(URL.createObjectURL(file));
    }
  };

  const handleGuardarCentro = async () => {
    if (!centro) return;
    setGuardandoCentro(true);
    setError("");
    setExitoCentro("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    const formData = new FormData();
    formData.append("centroId", String(centroActivo.id));
    formData.append("nombre", centro.nombre);
    formData.append("email", centro.email || "");
    formData.append("sitioWeb", centro.sitioWeb || "");
    formData.append("telefono", centro.telefono || "");
    formData.append("direccion", centro.direccion || "");
    formData.append("director", centro.director || "");
    formData.append("anoAcademico", centro.anoAcademico || "");
    formData.append("inicioAnoAcademico", centro.inicioAnoAcademico || "");
    if (logoArchivo) formData.append("logo", logoArchivo);

    try {
      const res = await fetch(`${API_URL}/api/admin/ajustes/centro`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al guardar");
      setExitoCentro("Cambios guardados correctamente");
      setLogoArchivo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardandoCentro(false);
    }
  };

  const handleGuardarAdmin = async () => {
    if (!admin) return;
    setGuardandoAdmin(true);
    setError("");
    setExitoAdmin("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    const formData = new FormData();
    formData.append("centroId", String(centroActivo.id));
    formData.append("nombre", admin.nombre);
    formData.append("apellidos", admin.apellidos || "");
    formData.append("telefono", admin.telefono || "");
    formData.append("email", admin.email);
    if (fotoAdminArchivo) formData.append("foto", fotoAdminArchivo);

    try {
      const res = await fetch(`${API_URL}/api/admin/ajustes/admin`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al guardar");
      setExitoAdmin("Cambios guardados correctamente");
      setFotoAdminArchivo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardandoAdmin(false);
    }
  };

  if (loading) return <p>Cargando ajustes...</p>;
  if (error && !centro) {
    return (
      <div className="content">
        <p>{error}</p>
      </div>
    );
  }
  if (!centro) return null;

  return (
    <div className="content admin-ajustes-page">
      <h1>Ajustes</h1>

      {/* INFORMACIÓN DEL CENTRO */}
      <div className="admin-ajustes-card">
        <div className="admin-ajustes-header">
          <div>
            <h3>Información del centro</h3>
            <p>Actualiza la información básica de tu centro educativo</p>
          </div>

          <button
            className="btn-guardar-verde"
            onClick={handleGuardarCentro}
            disabled={guardandoCentro}
          >
            {guardandoCentro ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        <div className="admin-ajustes-grid-admin">
          {/* LOGO DEL CENTRO */}
          <div className="admin-ajustes-logo-col">
            <div className="admin-ajustes-avatar-container">
              <img
                src={logoPreview || centro.logoUrl || logoCentro}
                alt="logo del centro"
                className="admin-ajustes-logo-img"
              />
              <button
                type="button"
                className="perfil-avatar-boton-camara"
                onClick={() => inputLogoRef.current?.click()}
              >
                <Camera size={16} />
              </button>

              <input
                type="file"
                accept="image/jpeg,image/png"
                ref={inputLogoRef}
                style={{ display: "none" }}
                onChange={handleLogoChange}
              />
            </div>

            <p className="admin-ajustes-cambiar-logo">Cambiar logo</p>

            <span className="admin-ajustes-formatos">
              Formatos JPG, PNG. MAX 2MB
            </span>
          </div>

          {/* INFORMACIÓN PRINCIPAL DEL CENTRO */}
          <div className="admin-ajustes-form-col">
            <label>Nombre del centro</label>

            <input
              value={centro.nombre}
              onChange={(e) =>
                setCentro({
                  ...centro,
                  nombre: e.target.value,
                })
              }
            />

            <label>Código del centro</label>

            <p className="perfil-alumno-valor">{centro.codigo ?? "-"}</p>

            <label>Teléfono</label>

            <input
              value={centro.telefono || ""}
              onChange={(e) =>
                setCentro({
                  ...centro,
                  telefono: e.target.value,
                })
              }
            />

            <label>Dirección</label>

            <textarea
              className="modal-textarea"
              rows={6}
              value={centro.direccion || ""}
              onChange={(e) =>
                setCentro({
                  ...centro,
                  direccion: e.target.value,
                })
              }
            />
          </div>

          {/* INFORMACIÓN ADICIONAL DEL CENTRO */}
          <div className="admin-ajustes-form-col">
            <label>Correo electrónico</label>

            <input
              value={centro.email || ""}
              onChange={(e) =>
                setCentro({
                  ...centro,
                  email: e.target.value,
                })
              }
            />

            <label>Sitio web</label>

            <input
              value={centro.sitioWeb || ""}
              onChange={(e) =>
                setCentro({
                  ...centro,
                  sitioWeb: e.target.value,
                })
              }
            />

            <label>Director / Responsable</label>

            <input
              value={centro.director || ""}
              onChange={(e) =>
                setCentro({
                  ...centro,
                  director: e.target.value,
                })
              }
            />

            <label>Año académico actual</label>

            <select
              className="filtro-select-ajustes-ad"
              value={centro.anoAcademico || ""}
              onChange={(e) =>
                setCentro({
                  ...centro,
                  anoAcademico: e.target.value,
                })
              }
            >
              <option value="">Selecciona un año</option>
              <option value="2024-2025">2024 - 2025</option>
              <option value="2025-2026">2025 - 2026</option>
              <option value="2026-2027">2026 - 2027</option>
            </select>
            <label>Inicio del año académico</label>
            <input
              type="date"
              className="date-ad"
              value={
                centro.inicioAnoAcademico
                  ? centro.inicioAnoAcademico.split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setCentro({
                  ...centro,
                  inicioAnoAcademico: e.target.value,
                })
              }
            />
          </div>
        </div>

        {error && <p className="perfil-error">{error}</p>}

        {exitoCentro && <p className="perfil-exito">{exitoCentro}</p>}
      </div>

      {/* INFORMACIÓN DEL ADMINISTRADOR */}
      {admin && (
        <div className="admin-ajustes-card">
          <div className="admin-ajustes-header">
            <div>
              <h3>Información del administrador</h3>

              <p>
                Actualiza la información básica del administrador de tu centro
                educativo
              </p>
            </div>

            <button
              className="btn-guardar-verde"
              onClick={handleGuardarAdmin}
              disabled={guardandoAdmin}
            >
              {guardandoAdmin ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>

          <div className="admin-ajustes-grid-2col">
            {/* FOTO Y DATOS DEL ADMIN */}
            <div className="admin-ajustes-logo-col">
              <div className="admin-ajustes-avatar-container">
                <img
                  src={fotoAdminPreview || admin?.fotoUrl || avatarDefault}
                  alt="avatar del administrador"
                  className="admin-ajustes-avatar-img"
                />

                <button
                  type="button"
                  className="perfil-avatar-boton-camara"
                  onClick={() => inputFotoAdminRef.current?.click()}
                >
                  <Camera size={16} />
                </button>

                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  ref={inputFotoAdminRef}
                  style={{ display: "none" }}
                  onChange={handleFotoAdminChange}
                />
              </div>

              <p className="admin-ajustes-cambiar-logo">Cambiar foto</p>

              <span className="admin-ajustes-formatos">
                Formatos JPG, PNG. MAX 2MB
              </span>
            </div>

            {/* DATOS DEL ADMINISTRADOR */}
            <div className="admin-ajustes-form-col">
              <label>Nombre del admin</label>

              <input
                value={admin?.nombre || ""}
                onChange={(e) =>
                  setAdmin((prev) =>
                    prev
                      ? {
                          ...prev,
                          nombre: e.target.value,
                        }
                      : prev,
                  )
                }
              />

              <label>Apellidos del admin</label>

              <input
                value={admin?.apellidos || ""}
                onChange={(e) =>
                  setAdmin((prev) =>
                    prev
                      ? {
                          ...prev,
                          apellidos: e.target.value,
                        }
                      : prev,
                  )
                }
              />

              <label>Teléfono</label>

              <input
                value={admin?.telefono || ""}
                onChange={(e) =>
                  setAdmin((prev) =>
                    prev
                      ? {
                          ...prev,
                          telefono: e.target.value,
                        }
                      : prev,
                  )
                }
              />
              <label>Código del admin</label>

              <p className="perfil-alumno-valor">{admin?.codigo ?? "-"}</p>
              <label>Correo electrónico</label>

              <input
                value={admin?.email || ""}
                onChange={(e) =>
                  setAdmin((prev) =>
                    prev
                      ? {
                          ...prev,
                          email: e.target.value,
                        }
                      : prev,
                  )
                }
              />
            </div>
          </div>

          {exitoAdmin && <p className="perfil-exito">{exitoAdmin}</p>}
        </div>
      )}
    </div>
  );
}

export default AjustesAdmin;
