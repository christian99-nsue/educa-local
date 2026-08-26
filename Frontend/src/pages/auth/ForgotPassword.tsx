import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/images/Libro1.1.png";
import illustration from "../../assets/images/IMG3.1.png";
import { useTranslation } from "react-i18next";
import "../../styles/auth/Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faGlobe,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email,
      });
      setMessage(res.data.message);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message || "Error al enviar el correo",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT */}
      <div className="login-left">
        <div className="edu-logo">
          <img src={logo} className="logo-img" />
          <h1 className="edu-local-logo">EDUCA LOCAL</h1>
        </div>
        <h1 className="edu">
          Recupera <br />
          <span>tu cuenta</span>
        </h1>
        <p>
          Introduce tu correo electrónico y te enviaremos <br /> un enlace para
          restablecer tu contraseña.
        </p>
        <div className="illustration">
          <img src={illustration} />
        </div>
        <div className="oval-note">
          <span className="oval">
            <FontAwesomeIcon icon={faUsers} size="2x" />
          </span>
          <small>{t("small_note")}</small>
        </div>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <div className="lang">
          <FontAwesomeIcon icon={faGlobe} />
          <select onChange={changeLanguage}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        <h2 className="rc">Recuperar contraseña</h2>
        <p>
          Te enviaremos un enlace a tu correo{" "}
          <FontAwesomeIcon icon={faEnvelope} size="lg" />
        </p>

        <form onSubmit={handleSubmit}>
          <h5 className="ce">Correo electrónico</h5>
          <div className="input-box">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M112 128C85.5 128 64 149.5 64 176C64 191.1 71.1 205.3 83.2 214.4L291.2 370.4C308.3 383.2 331.7 383.2 348.8 370.4L556.8 214.4C568.9 205.3 576 191.1 576 176C576 149.5 554.5 128 528 128L112 128zM64 260L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 260L377.6 408.8C343.5 434.4 296.5 434.4 262.4 408.8L64 260z" />
            </svg>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="error-forgot">
            <span className="login-error">{error || message || "\u00A0"}</span>
          </div>

          <button className="login" type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <div className="register">
          <p>
            ¿Recuerdas tu contraseña?&nbsp;&nbsp;
            <a onClick={() => navigate("/")}>
              Volver al login
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                <path d="M566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3C348.8 149.8 348.8 170.1 361.3 182.6L466.7 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L466.7 352L361.3 457.4C348.8 469.9 348.8 490.2 361.3 502.7C373.8 515.2 394.1 515.2 406.6 502.7L566.6 342.7z" />
              </svg>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
