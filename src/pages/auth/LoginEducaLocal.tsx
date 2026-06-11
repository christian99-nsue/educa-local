import { useState } from "react";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.1C9.5 35.7 16.2 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C36.9 36.2 44 31 44 24c0-1.3-.1-2.6-.4-3.9z"
    />
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21">
    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 814 1000">
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.8 134.4-318 266.5-318 71 0 130.1 46.9 175 46.9 42.9 0 110.1-52 191.6-52 30.8 0 103.2 2.6 157.2 46.8zm-186.9-117.6c17.8-21.6 30.8-52 30.8-82.4 0-42.5-15.5-86.1-44.3-115.7-26.1-27.2-68.2-48.8-108.5-48.8-1.8 0-3.6.1-5.4.2 1.1 43.4 17.9 86.8 44.5 116.8 24.4 27.6 63.7 48.6 83 47.9z" />
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

export default function LoginEducaLocal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState("Español");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f2f5",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: "960px",
          minHeight: "580px",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* LEFT PANEL */}
        <div
          style={{
            flex: "0 0 42%",
            background:
              "linear-gradient(160deg, #0d1b3e 0%, #1a2a6c 50%, #0d1b3e 100%)",
            padding: "40px 36px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background circles for depth */}
          <div
            style={{
              position: "absolute",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: "rgba(120,80,255,0.08)",
              bottom: "-80px",
              right: "-80px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "rgba(80,180,255,0.06)",
              top: "100px",
              left: "-60px",
            }}
          />

          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              zIndex: 1,
            }}
          >
            <div style={{ fontSize: "28px" }}>📖</div>
            <span
              style={{
                color: "white",
                fontWeight: "800",
                fontSize: "18px",
                letterSpacing: "0.5px",
              }}
            >
              EDUCA LOCAL
            </span>
          </div>

          {/* Headline */}
          <div style={{ zIndex: 1 }}>
            <h2
              style={{
                color: "white",
                fontSize: "30px",
                fontWeight: "800",
                lineHeight: "1.2",
                margin: "0 0 8px 0",
              }}
            >
              Tu educación,
            </h2>
            <h2
              style={{
                background: "linear-gradient(90deg, #38bdf8, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "30px",
                fontWeight: "800",
                margin: "0 0 16px 0",
              }}
            >
              sin límites
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: "14px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Accede a tus cursos, tareas y recursos desde cualquier lugar.
              Aprende, crece y alcanza tus metas.
            </p>
          </div>

          {/* Laptop illustration (CSS-based) */}
          <div
            style={{
              zIndex: 1,
              display: "flex",
              justifyContent: "center",
              margin: "10px 0",
            }}
          >
            <div
              style={{
                width: "200px",
                height: "130px",
                background: "linear-gradient(135deg, #1e293b, #334155)",
                borderRadius: "10px 10px 0 0",
                border: "2px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "175px",
                  height: "105px",
                  background:
                    "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                  borderRadius: "6px",
                  opacity: 0.85,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "36px" }}>🎓</span>
              </div>
            </div>
          </div>

          {/* Bottom badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                flexShrink: 0,
              }}
            >
              👥
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "13px",
                margin: 0,
                lineHeight: "1.4",
              }}
            >
              Miles de estudiantes ya están aprendiendo en{" "}
              <strong style={{ color: "white" }}>Educa Local</strong>
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            padding: "36px 48px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Language selector */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#475569",
              }}
            >
              🌐 {language} ▾
            </div>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "30px",
              fontWeight: "800",
              color: "#0f172a",
              margin: "0 0 4px 0",
            }}
          >
            Iniciar sesión
          </h1>
          <p
            style={{
              color: "#64748b",
              fontSize: "14px",
              margin: "0 0 28px 0",
            }}
          >
            Bienvenido de nuevo 👋
          </p>

          {/* Email field */}
          <label
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#1e293b",
              marginBottom: "6px",
            }}
          >
            ID o Correo electrónico
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1.5px solid #e2e8f0",
              borderRadius: "10px",
              padding: "10px 14px",
              marginBottom: "18px",
              gap: "10px",
              transition: "border-color 0.2s",
            }}
          >
            <span style={{ color: "#94a3b8", fontSize: "16px" }}>✉️</span>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: "14px",
                color: "#0f172a",
                backgroundColor: "transparent",
              }}
            />
          </div>

          {/* Password field */}
          <label
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#1e293b",
              marginBottom: "6px",
            }}
          >
            Contraseña
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1.5px solid #e2e8f0",
              borderRadius: "10px",
              padding: "10px 14px",
              marginBottom: "8px",
              gap: "10px",
            }}
          >
            <span style={{ color: "#94a3b8", fontSize: "16px" }}>🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: "14px",
                color: "#0f172a",
                backgroundColor: "transparent",
              }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                padding: 0,
                display: "flex",
              }}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: "right", marginBottom: "22px" }}>
            <a
              href="#"
              style={{
                color: "#9333ea",
                fontSize: "13px",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Login button */}
          <button
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(90deg, #a855f7, #9333ea)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              marginBottom: "20px",
              letterSpacing: "0.3px",
              boxShadow: "0 4px 15px rgba(147,51,234,0.35)",
            }}
          >
            Iniciar sesión
          </button>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>
              o continúa con
            </span>
            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
          </div>

          {/* Social buttons */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
            {[
              { icon: <GoogleIcon />, label: "Google" },
              { icon: <MicrosoftIcon />, label: "Microsoft" },
              { icon: <AppleIcon />, label: "Apple" },
            ].map(({ icon, label }) => (
              <button
                key={label}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "10px",
                  background: "white",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#1e293b",
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Register link */}
          <p
            style={{
              textAlign: "center",
              fontSize: "13px",
              color: "#64748b",
              margin: 0,
            }}
          >
            ¿Eres un centro y no tienes una cuenta?{" "}
            <a
              href="#"
              style={{
                color: "#9333ea",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Regístrate aquí →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
