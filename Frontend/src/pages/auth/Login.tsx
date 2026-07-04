import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z" />
            </svg>
          </span>
          <small>{t("small_note")}</small>
        </div>
      </div>
      {/* RIGHT SIDE */}
      <div className="login-right">
        {/* TOP LANGUAGE */}
        <div className="lang">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path d="M415.9 344L225 344C227.9 408.5 242.2 467.9 262.5 511.4C273.9 535.9 286.2 553.2 297.6 563.8C308.8 574.3 316.5 576 320.5 576C324.5 576 332.2 574.3 343.4 563.8C354.8 553.2 367.1 535.8 378.5 511.4C398.8 467.9 413.1 408.5 416 344zM224.9 296L415.8 296C413 231.5 398.7 172.1 378.4 128.6C367 104.2 354.7 86.8 343.3 76.2C332.1 65.7 324.4 64 320.4 64C316.4 64 308.7 65.7 297.5 76.2C286.1 86.8 273.8 104.2 262.4 128.6C242.1 172.1 227.8 231.5 224.9 296zM176.9 296C180.4 210.4 202.5 130.9 234.8 78.7C142.7 111.3 74.9 195.2 65.5 296L176.9 296zM65.5 344C74.9 444.8 142.7 528.7 234.8 561.3C202.5 509.1 180.4 429.6 176.9 344L65.5 344zM463.9 344C460.4 429.6 438.3 509.1 406 561.3C498.1 528.6 565.9 444.8 575.3 344L463.9 344zM575.3 296C565.9 195.2 498.1 111.3 406 78.7C438.3 130.9 460.4 210.4 463.9 296L575.3 296z" />
          </svg>
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
