import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import RegisterSteps from "../../components/RegisterSteps";
import CountrySelect from "../../components/CountrySelect";
import PhoneInput from "../../components/PhoneInput";
import type { Pais } from "../../utils/countries";
import "../../styles/Login.css";

// IMAGES
import logo from "../../assets/images/Libro1.1.png";
import illustration from "../../assets/images/IMG3.1.png";

const Register = () => {
  const [nombre_del_centro, setNombre_del_centro] = useState("");
  const [tipo_de_centro, setTipo_de_centro] = useState("");
  const [paisSeleccionado, setPaisSeleccionado] = useState<Pais | null>(null);
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [errorNombre_del_centro, setErrorNombre_del_centro] = useState("");
  const [errorTipo_de_centro, setErrorTipo_de_centro] = useState("");
  const [errorPais, setErrorPais] = useState("");
  const [errorCiudad, setErrorCiudad] = useState("");
  const [errorTelefono, setErrorTelefono] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    let isValid = true;

    if (!nombre_del_centro.trim()) {
      setErrorNombre_del_centro("Nombre del centro obligatorio");
      isValid = false;
    } else {
      setErrorNombre_del_centro("");
    }

    if (!tipo_de_centro.trim()) {
      setErrorTipo_de_centro("Selecciona un tipo de centro");
      isValid = false;
    } else {
      setErrorTipo_de_centro("");
    }

    if (!paisSeleccionado) {
      setErrorPais("Selecciona un país");
      isValid = false;
    } else {
      setErrorPais("");
    }

    if (!ciudad.trim()) {
      setErrorCiudad("Ciudad obligatoria");
      isValid = false;
    } else {
      setErrorCiudad("");
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

    const emailLimpio = email.trim();
    if (!emailLimpio) {
      setErrorEmail("Email obligatorio");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
      setErrorEmail("Email inválido");
      isValid = false;
    } else {
      setErrorEmail("");
    }

    return isValid;
  };

  const handleContinuar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const centroData = {
        nombre_del_centro,
        tipo_de_centro,
        pais: paisSeleccionado?.nombre ?? "",
        codigoTelefono: paisSeleccionado?.codigoTelefono ?? "",
        ciudad,
        direccion,
        telefono: `${paisSeleccionado?.codigoTelefono ?? ""} ${telefono}`,
        email,
      };

      sessionStorage.setItem("registro_centro", JSON.stringify(centroData));

      navigate("/register-admin-account", {
        state: { centro: centroData },
      });
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
          Registra,
          <br /> <span>Tu centro</span>
        </h1>
        <p>
          Gestiona los cursos, los alumnos,
          <br />
          los profesores, las notas y ten
          <br />
          control de todo tu centro.
        </p>
        <div className="illustration">
          <img src={illustration} />
        </div>
        <div className="oval-note">
          <span className="oval">
            <FontAwesomeIcon icon={faUsers} size="2x" />
          </span>
          <small>
            Miles de estudiantes ya estan aprendiendo en Educa Local
          </small>
        </div>
      </div>
      {/* RIGHT SIDE */}
      <div className="login-right-reg">
        <RegisterSteps currentStep={1} />
        <div className="info">
          <p className="info-sm">
            Información del centro <br />
            <small>
              Cuéntanos algunos datos básicos de tu centro educativo.
            </small>
          </p>
          <form className="form" onSubmit={handleContinuar}>
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="Nombre del Centro">Nombre del centro</label>
                {errorNombre_del_centro && (
                  <span className="lg-error">
                    {errorNombre_del_centro || "\u00A0"}
                  </span>
                )}
              </div>
              <input
                type="text"
                name="Nombre del centro"
                id="Nombre del Centro"
                placeholder="Tu colegio"
                value={nombre_del_centro}
                onChange={(e) => {
                  setNombre_del_centro(e.target.value);
                  if (errorNombre_del_centro) setErrorNombre_del_centro("");
                }}
              />
            </div>
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="Tipo de centro">Tipo de centro</label>
                {errorTipo_de_centro && (
                  <span className="lg-error">
                    {errorTipo_de_centro || "\u00A0"}
                  </span>
                )}
              </div>
              <select
                name="Tipo de Centro"
                id="Tipo de Centro"
                value={tipo_de_centro}
                onChange={(e) => {
                  setTipo_de_centro(e.target.value);
                  if (errorTipo_de_centro) setErrorTipo_de_centro("");
                }}
              >
                <option value="" disabled>
                  -- Selecciona un tipo --
                </option>
                <option value="Colegio">Colegio</option>
                <option value="Instituto">Instituto</option>
                <option value="Centro">Centro</option>
              </select>
            </div>
            <div className="form-group">
              <CountrySelect
                value={paisSeleccionado?.codigoIso ?? ""}
                onChange={(pais) => {
                  setPaisSeleccionado(pais);
                  if (errorPais) setErrorPais("");
                }}
                error={errorPais}
              />
            </div>
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="Ciudad">Ciudad</label>
                {errorCiudad && (
                  <span className="lg-error">{errorCiudad || "\u00A0"}</span>
                )}
              </div>
              <input
                type="text"
                placeholder="Ciudad donde se encuentra el centro"
                id="Ciudad"
                name="Ciudad"
                value={ciudad}
                onChange={(e) => {
                  setCiudad(e.target.value);
                  if (errorCiudad) setErrorCiudad("");
                }}
              />
            </div>
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="Direccion">Dirección (Opcional)</label>
              </div>
              <input
                type="text"
                name="Dirección"
                id="Direccion"
                placeholder="Direccion del centro"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>
            <div className="form-group">
              <PhoneInput
                codigoTelefono={paisSeleccionado?.codigoTelefono ?? ""}
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
                <label htmlFor="Correo-institucional">
                  Correo institucional
                </label>
                {errorEmail && (
                  <span className="lg-error">{errorEmail || "\u00A0"}</span>
                )}
              </div>
              <input
                type="email"
                id="Correo-institucional"
                placeholder="tucentro@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorEmail) setErrorEmail("");
                }}
              />
            </div>
            <button className="conti" type="submit">
              Continuar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
