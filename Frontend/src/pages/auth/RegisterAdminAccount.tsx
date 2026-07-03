import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PhoneInput from "../../components/PhoneInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import RegisterSteps from "../../components/RegisterSteps";
import "../../styles/Login.css";

// IMAGES
import logo from "../../assets/images/Libro1.1.png";
import illustration from "../../assets/images/IMG3.1.png";

interface CentroData {
  nombre_del_centro: string;
  tipo_de_centro: string;
  pais: string;
  codigoTelefono: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  email: string;
}

const RegisterAdminAccount = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Recupera los datos del centro del paso 1 (state o sessionStorage como respaldo)
  const centro: CentroData | null =
    state?.centro ??
    JSON.parse(sessionStorage.getItem("registro_centro") ?? "null");
  const codigoTelefono = centro?.codigoTelefono ?? "";

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorTelefono, setErrorTelefono] = useState("");
  const [errorApellidos, setErrorApellidos] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [errorCorreo, setErrorCorreo] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");

  const validate = () => {
    let isValid = true;

    if (!nombre.trim()) {
      setErrorNombre("Nombre completo obligatorio");
      isValid = false;
    } else {
      setErrorNombre("");
    }
    if (!apellidos.trim()) {
      setErrorApellidos("Apellidos obligatorios");
      isValid = false;
    } else {
      setErrorApellidos("");
    }

    const correoLimpio = correo.trim();
    if (!correoLimpio) {
      setErrorCorreo("Correo electrónico obligatorio");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      setErrorCorreo("Correo electrónico inválido");
      isValid = false;
    } else {
      setErrorCorreo("");
    }
    const telefonoLimpio = telefono.trim();
    if (!telefonoLimpio) {
      setErrorTelefono("Teléfono obligatorio");
      isValid = false;
    } else if (!/^\d{6,15}$/.test(telefonoLimpio)) {
      setErrorTelefono("Teléfono inválido (solo números, 6-15 dígitos)");
      isValid = false;
    } else {
      setErrorTelefono("");
    }
    if (!password) {
      setErrorPassword("Contraseña obligatoria");
      isValid = false;
    } else if (password.length < 6) {
      setErrorPassword("Mínimo 6 caracteres");
      isValid = false;
    } else {
      setErrorPassword("");
    }

    if (!confirmPassword) {
      setErrorConfirmPassword("Confirma tu contraseña");
      isValid = false;
    } else if (password !== confirmPassword) {
      setErrorConfirmPassword("Las contraseñas no coinciden");
      isValid = false;
    } else {
      setErrorConfirmPassword("");
    }

    return isValid;
  };

  const handleVolver = () => {
    navigate("/register");
  };

  const handleContinuar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const adminData = {
        nombre,
        apellidos,
        correo,
        telefono,
        password,
      };

      sessionStorage.setItem("registro_admin", JSON.stringify(adminData));

      navigate("/register-academic-structure", {
        state: { centro, admin: adminData },
      });
    }
  };

  return (
    <div className="login-container">
      {/* LEFT SIDE */}
      <div className="login-left">
        <div className="edu-logo">
          <img src={logo} className="logo" />
          <h1 className="edu-local">EDUCA LOCAL</h1>
        </div>

        <h1 className="edu">
          Tu educacion,
          <br /> <span>sin limites</span>
        </h1>
        <p>
          Accede a tus cursos, tareas y recursos
          <br />
          desde cualquier lugar. Aprende, crece
          <br />y alcanza tus metas.
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
          <small>
            Miles de estudiantes ya estan aprendiendo en Educa Local
          </small>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right-reg">
        <RegisterSteps currentStep={2} />

        <div className="info">
          <p className="info-sm">
            Cuenta del administrador <br />
            <small>
              Este será el administrador principal del centro y tendrá acceso{" "}
              <br />
              total a la plataforma.
            </small>
          </p>
          <form className="form" onSubmit={handleContinuar}>
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="NombreCompleto">Nombre</label>
                {errorNombre && (
                  <span className="lg-error">{errorNombre || "\u00A0"}</span>
                )}
              </div>
              <input
                type="text"
                id="Nombre"
                placeholder="María"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errorNombre) setErrorNombre("");
                }}
              />
            </div>
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="Apellidos">Apellidos</label>
                {errorApellidos && (
                  <span className="lg-error">{errorApellidos || "\u00A0"}</span>
                )}
              </div>
              <input
                type="text"
                id="Apellidos"
                placeholder="Ndong Abeso"
                value={apellidos}
                onChange={(e) => {
                  setApellidos(e.target.value);
                  if (errorApellidos) setErrorApellidos("");
                }}
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="CorreoAdmin">Correo electrónico</label>
                {errorCorreo && (
                  <span className="lg-error">{errorCorreo || "\u00A0"}</span>
                )}
              </div>
              <input
                type="email"
                id="CorreoAdmin"
                placeholder="maria.ndong@gmail.com"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  if (errorCorreo) setErrorCorreo("");
                }}
              />
            </div>

            <div className="form-group">
              <PhoneInput
                codigoTelefono={codigoTelefono}
                value={telefono}
                onChange={(value) => {
                  setTelefono(value);
                  if (errorTelefono) setErrorTelefono("");
                }}
                error={errorTelefono}
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="PasswordAdmin">Contraseña</label>
                {errorPassword && (
                  <span className="lg-error">{errorPassword || "\u00A0"}</span>
                )}
              </div>
              <div className="input-box-password-reg">
                <input
                  type={showPassword ? "text" : "password"}
                  id="PasswordAdmin"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorPassword) setErrorPassword("");
                  }}
                />
                <span
                  className="eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </span>
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="ConfirmPasswordAdmin">
                  Confirmar contraseña
                </label>
                {errorConfirmPassword && (
                  <span className="lg-error">
                    {errorConfirmPassword || "\u00A0"}
                  </span>
                )}
              </div>
              <div className="input-box-password-reg">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="ConfirmPasswordAdmin"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorConfirmPassword) setErrorConfirmPassword("");
                  }}
                />
                <span
                  className="eye"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                  />
                </span>
              </div>
            </div>

            <div className="form-buttons">
              <button
                type="button"
                className="btn-volver"
                onClick={handleVolver}
              >
                Volver
              </button>
              <button type="submit" className="btn-continuar">
                Continuar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterAdminAccount;
