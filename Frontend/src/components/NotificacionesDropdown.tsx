import { useEffect, useState } from "react";
import {
  Bell,
  FileText,
  ClipboardCheck,
  FolderPlus,
  Upload,
  type LucideIcon,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  enlace: string | null;
  leida: boolean;
  createdAt: string;
}

const iconoPorTipo: Record<string, LucideIcon> = {
  tarea_publicada: FileText,
  tarea_calificada: ClipboardCheck,
  material_publicado: FolderPlus,
  tarea_entregada: Upload,
};

function NotificacionesDropdown() {
  const [abierto, setAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [totalNoLeidas, setTotalNoLeidas] = useState(0);
  const navigate = useNavigate();

  const cargar = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setNotificaciones(data.notificaciones);
        setTotalNoLeidas(data.totalNoLeidas);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial y polling, patron estandar
    cargar();
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const cerrar = () => setAbierto(false);
    if (abierto) document.addEventListener("click", cerrar);
    return () => document.removeEventListener("click", cerrar);
  }, [abierto]);

  const handleClickNotificacion = async (n: Notificacion) => {
    const token = localStorage.getItem("token");
    if (!n.leida) {
      await fetch(`${API_URL}/api/notificaciones/${n.id}/leida`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      cargar();
    }
    if (n.enlace) {
      const ruta = n.enlace.replace(/^https?:\/\/[^/]+/, "");
      navigate(ruta);
    }
    setAbierto(false);
  };

  const marcarTodasLeidas = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/api/notificaciones/marcar-todas`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    cargar();
  };

  const tiempoRelativo = (fecha: string) => {
    // eslint-disable-next-line react-hooks/purity -- calculo de tiempo relativo para mostrar texto, no afecta el estado de React
    const diffMs = Date.now() - new Date(fecha).getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return "Ahora";
    if (min < 60) return `Hace ${min} min`;
    const horas = Math.floor(min / 60);
    if (horas < 24) return `Hace ${horas}h`;
    return `Hace ${Math.floor(horas / 24)}d`;
  };

  return (
    <div className="notif-wrapper" onClick={(e) => e.stopPropagation()}>
      <button className="notif-boton" onClick={() => setAbierto((v) => !v)}>
        <Bell size={20} />
        {totalNoLeidas > 0 && (
          <span className="notif-badge">{totalNoLeidas}</span>
        )}
      </button>

      {abierto && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <strong>Notificaciones</strong>
            {totalNoLeidas > 0 && (
              <span className="notif-marcar-todas" onClick={marcarTodasLeidas}>
                Marcar todas como leidas
              </span>
            )}
          </div>
          <div className="notif-lista">
            {notificaciones.length === 0 ? (
              <p className="notif-vacio">No tienes notificaciones.</p>
            ) : (
              notificaciones.map((n) => {
                const Icono = iconoPorTipo[n.tipo] ?? Bell;
                return (
                  <div
                    key={n.id}
                    className={`notif-item ${!n.leida ? "no-leida" : ""}`}
                    onClick={() => handleClickNotificacion(n)}
                  >
                    <div className="notif-icono">
                      <Icono size={16} />
                    </div>
                    <div className="notif-info">
                      <strong>{n.titulo}</strong>
                      <span>{n.mensaje}</span>
                      <span className="notif-tiempo">
                        {tiempoRelativo(n.createdAt)}
                      </span>
                    </div>
                    {!n.leida && <span className="notif-punto" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificacionesDropdown;
