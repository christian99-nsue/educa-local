import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faUsers,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { GoogleLogin } from "@react-oauth/google";
import { useMsal } from "@azure/msal-react";
import {
  isMicrosoftAuthConfigured,
  microsoftLoginRequest,
} from "../../authConfig";
import "../../styles/Login.css";

// IMAGES
import logo from "../../assets/images/Libro1.1.png";
import illustration from "../../assets/images/IMG3.1.png";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();
  const { instance } = useMsal();

  const handleRedirectByRole = (rol: string) => {
    if (rol === "admin") navigate("/admin");
    else if (rol === "profesor") navigate("/profesor");
    else navigate("/alumno");
  };
  const finishLogin = (data: LoginResponse) => {
    const { token, user } = data;
    const centros = data.centros ?? [];

    localStorage.setItem("token", token);
    localStorage.setItem("centros", JSON.stringify(centros));

    if (centros.length > 1) {
      navigate("/select-centro", {
        state: {
          centros: data.centros,
          user: data.user,
        },
      });
    } else if (centros.length === 1) {
      const centro = centros[0];
      const rol = centro.rol_en_centro ?? centro.rol ?? "alumno";

      const fullUser = {
        ...user,
        rol_en_centro: rol,
        centro: {
          nombre: centro.nombre ?? centro.centro_nombre,
        },
      };

      localStorage.setItem("user", JSON.stringify(fullUser));
      localStorage.setItem("centroActivo", JSON.stringify(centro));

      handleRedirectByRole(rol);
    } else {
      setError("No tienes centros asignados");
    }
  };

  useEffect(() => {
    instance
      .handleRedirectPromise()
      .then(async (response) => {
        if (!response) return;
        if (!response.idToken) return;

        const res = await axios.post(
          "http://localhost:3001/api/auth/microsoft",
          {
            idToken: response.idToken,
          },
        );
        finishLogin(res.data);
      })
      .catch((err) => {
        console.log("Error redirect Microsoft:", err);
      }); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  type Centro = {
    id?: number;
    nombre?: string;
    centro_nombre?: string;
    rol?: string;
    rol_en_centro?: string;
  };

  type LoginResponse = {
    token: string;
    centros: Centro[];
    user?: {
      id: number;
      email: string;
      code?: string;
    };
  };

  const { i18n } = useTranslation();
  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier || !password) {
      setError("Introduce tu correo/codigo y contraseña");
      return;
    }

    if (/^\$2[aby]\$\d{2}\$/.test(password)) {
      setError(
        "Introduce la contrasena real, no el hash guardado en la base de datos",
      );
      return;
    }

    try {
      const res = await axios.post("http://localhost:3001/api/auth/login", {
        identifier: cleanIdentifier,
        password,
      });

      finishLogin(res.data);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Error inesperado");
    }
  };

  const handleMicrosoftLogin = async () => {
    if (!isMicrosoftAuthConfigured) {
      setError(
        "Configura VITE_MICROSOFT_CLIENT_ID para iniciar sesión con Microsoft.",
      );
      return;
    }
    try {
      setError("");
      await instance.loginRedirect({
        ...microsoftLoginRequest,
        prompt: "select_account",
      });
    } catch (err) {
      console.log("Error Microsoft:", err);
      setError("No se pudo iniciar sesión con Microsoft");
    }
  };

  return (
    <div className="login-container">
      {/* LEFT SIDE */}
      <div className="login-left">
        <div className="edu-logo">
          <img src={logo} className="logo-img" />
          <h1 className="edu-local-logo">EDUCA LOCAL</h1>
        </div>

        <h1 className="edu">
          {t("educacion")},<br /> <span>{t("limites")}</span>
        </h1>
        <p>
          {t("nota1")}
          <br />
          {t("nota2")}
          <br />
          {t("nota3")}
        </p>
        <div className="illustration">
          <img src={illustration} />
        </div>
        <div className="oval-note">
          <span className="oval">
            <FontAwesomeIcon icon={faUsers} />
          </span>
          <small>{t("small_note")}</small>
        </div>
      </div>
      {/* RIGHT SIDE */}
      <div className="login-right">
        {/* TOP LANGUAGE */}
        <div className="lang">
          <FontAwesomeIcon icon={faGlobe} />
          <select onChange={changeLanguage}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
        <h2>{t("Iniciar sesión")}</h2>
        <p>{t("Bienvenido de nuevo")} 👋</p>
        <form onSubmit={handleLogin}>
          {/* EMAIL / CODE */}
          <h5 className="em">{t("correo")}</h5>
          <div className="input-box">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M112 128C85.5 128 64 149.5 64 176C64 191.1 71.1 205.3 83.2 214.4L291.2 370.4C308.3 383.2 331.7 383.2 348.8 370.4L556.8 214.4C568.9 205.3 576 191.1 576 176C576 149.5 554.5 128 528 128L112 128zM64 260L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 260L377.6 408.8C343.5 434.4 296.5 434.4 262.4 408.8L64 260z" />
            </svg>
            <input
              type="text"
              name="identifier"
              autoComplete="identifier"
              placeholder="tu@email.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          {/* PASSWORD */}
          <h5 className="psw">{t("contraseña")}</h5>
          <div className="input-box-password">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M256 160L256 224L384 224L384 160C384 124.7 355.3 96 320 96C284.7 96 256 124.7 256 160zM192 224L192 160C192 89.3 249.3 32 320 32C390.7 32 448 89.3 448 160L448 224C483.3 224 512 252.7 512 288L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 288C128 252.7 156.7 224 192 224z" />
            </svg>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder={t("Ingrese su contraseña")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          <div className="error-forgot">
            <span className="login-error">{error || "\u00A0"}</span>
            <span className="forgot">
              <a onClick={() => navigate("/forgot-password")}>
                ¿{t("Olvidaste tu contraseña")}?
              </a>
            </span>
          </div>

          <button className="login" type="submit">
            {t("login_button")}
          </button>
        </form>
        {/* SOCIAL LOGIN */}
        <div className="divider">
          <span>{t("o continua con")}</span>
        </div>
        <div className="social">
          <div className="google-button">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const token = credentialResponse.credential;

                  const res = await axios.post(
                    "http://localhost:3001/api/auth/google",
                    { token },
                  );
                  console.log("Respuesta del backend:", res.data);

                  const data = res.data;

                  const centros = Array.isArray(data.centros)
                    ? data.centros
                    : [];

                  localStorage.setItem("user", JSON.stringify(data.user));
                  localStorage.setItem("centros", JSON.stringify(centros));

                  if (centros.length > 1) {
                    localStorage.setItem("token", data.token);
                    navigate("/select-centro", {
                      state: {
                        centros: data.centros,
                        user: data.user,
                      },
                    });
                  } else if (centros.length === 1) {
                    const centro = centros[0];
                    const rol = centro.rol_en_centro ?? centro.rol ?? "alumno";

                    const fullUser = {
                      ...data.user,
                      rol_en_centro: rol,
                      centro: { nombre: centro.nombre ?? centro.centro_nombre },
                    };

                    localStorage.setItem("user", JSON.stringify(fullUser));
                    localStorage.setItem("token", data.token);
                    localStorage.setItem(
                      "centroActivo",
                      JSON.stringify(centro),
                    );

                    handleRedirectByRole(rol);
                  } else {
                    setError("No estás registrado en ningún centro");
                  }
                } catch (error: unknown) {
                  console.error(error);
                }
              }}
              onError={() => console.log("Login failed")}
              theme="outline"
              size="large"
              text="signin"
              shape="rectangular"
              logo_alignment="left"
              width="150"
            />
          </div>

          <button
            className="microsoft-button"
            onClick={handleMicrosoftLogin}
            disabled={!isMicrosoftAuthConfigured}
          >
            <svg viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            Iniciar sesión
          </button>
        </div>
        <div className="register">
          <p>
            {t("register_text")}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <a onClick={() => navigate("/register")}>
              {t("link_text")}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                <path d="M566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3C348.8 149.8 348.8 170.1 361.3 182.6L466.7 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L466.7 352L361.3 457.4C348.8 469.9 348.8 490.2 361.3 502.7C373.8 515.2 394.1 515.2 406.6 502.7L566.6 342.7z" />
              </svg>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
