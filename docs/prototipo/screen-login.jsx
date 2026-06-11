/* BusTrack BO — Login screen */

const Login = ({ onLogin }) => {
  const [email, setEmail] = React.useState("admin@bustrack.bo");
  const [pwd, setPwd] = React.useState("••••••••••");
  const [remember, setRemember] = React.useState(true);

  return (
    <div style={{
      minHeight: "100vh", display: "grid",
      gridTemplateColumns: "1fr 1.1fr",
      background: "var(--white)",
    }}>
      {/* Left — form */}
      <div style={{
        display: "flex", flexDirection: "column",
        padding: "40px 56px",
      }}>
        <Logo />

        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 380 }}>
            <div className="eyebrow" style={{ color: "var(--accent-700)", marginBottom: 12 }}>BIENVENIDO DE VUELTA</div>
            <h1 style={{
              margin: 0, fontSize: 32, fontWeight: 800,
              color: "var(--ink-900)", letterSpacing: "-0.025em", lineHeight: 1.15,
            }}>
              Inicia sesión en<br/>BusTrack <span style={{ color: "var(--accent-500)" }}>BO</span>
            </h1>
            <p className="muted" style={{ margin: "12px 0 32px", fontSize: 14.5, lineHeight: 1.5 }}>
              Plataforma de gestión para empresas de transporte interdepartamental de Bolivia.
            </p>

            <form onSubmit={e => { e.preventDefault(); onLogin(); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="field-label">Correo corporativo</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.bo" />
              </div>
              <div>
                <div className="h-stack" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                  <label className="field-label" style={{ margin: 0 }}>Contraseña</label>
                  <a href="#" style={{ fontSize: 12, color: "var(--brand-600)", fontWeight: 600 }}>¿Olvidaste tu contraseña?</a>
                </div>
                <div style={{ position: "relative" }}>
                  <input className="input" type="password" value={pwd} onChange={e => setPwd(e.target.value)} style={{ paddingRight: 40 }} />
                  <button type="button" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "var(--ink-500)", padding: 6 }}>
                    <I.Eye size={17} />
                  </button>
                </div>
              </div>

              <label className="h-stack" style={{ gap: 8, cursor: "pointer", marginTop: 4 }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: `1.5px solid ${remember ? "var(--brand-800)" : "var(--ink-300)"}`,
                  background: remember ? "var(--brand-800)" : "var(--white)",
                  display: "grid", placeItems: "center",
                }} onClick={() => setRemember(!remember)}>
                  {remember && <I.Check size={11} stroke={3} style={{ color: "#fff" }} />}
                </span>
                <span style={{ fontSize: 13, color: "var(--ink-700)" }}>Mantener mi sesión iniciada</span>
              </label>

              <button type="submit" className="btn btn-primary" style={{ height: 44, fontSize: 14, marginTop: 8, justifyContent: "center" }}>
                Iniciar sesión
                <I.ArrowRight size={16} />
              </button>

              <div className="h-stack" style={{ gap: 12, margin: "12px 0", color: "var(--ink-400)", fontSize: 12 }}>
                <div style={{ flex: 1, height: 1, background: "var(--ink-200)" }} />
                <span>o</span>
                <div style={{ flex: 1, height: 1, background: "var(--ink-200)" }} />
              </div>

              <button type="button" className="btn btn-outline" style={{ height: 44, justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h5.9c-.3 1.4-1 2.6-2.2 3.4v2.8h3.6c2.1-2 3.3-4.9 3.3-8.4z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.6H2.1v2.9C3.9 20.5 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.8 14c-.2-.7-.4-1.4-.4-2.1s.1-1.5.4-2.1V6.9H2.1C1.4 8.4 1 10.1 1 12s.4 3.6 1.1 5.1L5.8 14z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.3 1.7l3.2-3.2C17.5 2.1 15 1 12 1 7.7 1 3.9 3.5 2.1 6.9L5.8 9.8C6.7 7.1 9.1 5.4 12 5.4z"/></svg>
                Continuar con Google Workspace
              </button>
            </form>

            <div style={{ marginTop: 32, fontSize: 12.5, color: "var(--ink-500)" }}>
              ¿No tienes cuenta? <a href="#" style={{ color: "var(--brand-700)", fontWeight: 600 }}>Solicita acceso a tu administrador</a>
            </div>
          </div>
        </div>

        <div className="h-stack" style={{ justifyContent: "space-between", fontSize: 12, color: "var(--ink-500)" }}>
          <span>© 2026 BusTrack Bolivia S.R.L.</span>
          <div className="h-stack" style={{ gap: 18 }}>
            <a href="#">Términos</a>
            <a href="#">Privacidad</a>
            <a href="#">Soporte</a>
          </div>
        </div>
      </div>

      {/* Right — visual */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(155deg, var(--brand-900) 0%, var(--brand-700) 60%, var(--brand-600) 100%)",
        color: "#fff",
        padding: 48,
        display: "flex", flexDirection: "column",
      }}>
        {/* Topo lines (suggested Andean terrain) */}
        <svg viewBox="0 0 600 800" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          opacity: 0.18, pointerEvents: "none",
        }} preserveAspectRatio="none">
          {Array.from({ length: 24 }).map((_, i) => {
            const off = i * 16;
            return <path key={i} d={`M0 ${300 + off + Math.sin(i)*40} Q150 ${200 + off + Math.cos(i*1.3)*60} 300 ${280 + off + Math.sin(i*0.7)*50} T 600 ${260 + off}`} fill="none" stroke="#fff" strokeWidth="0.8"/>;
          })}
        </svg>

        {/* Glow */}
        <div style={{
          position: "absolute", right: -120, top: -120, width: 360, height: 360,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,146,32,0.35) 0%, transparent 65%)",
        }} />

        <div style={{ marginTop: "auto", position: "relative", zIndex: 1 }}>
          <div style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16, padding: "20px 22px",
            backdropFilter: "blur(8px)",
            maxWidth: 460, marginBottom: 28,
          }}>
            <div className="h-stack" style={{ gap: 12, marginBottom: 14 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ok-600)", boxShadow: "0 0 0 4px rgba(22,163,74,0.25)" }} />
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>EN VIVO · La Paz Terminal</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 8 }}>
              "Reducimos 38% el tiempo de cierre de caja al pasar de hojas Excel a BusTrack."
            </div>
            <div className="h-stack" style={{ gap: 10, marginTop: 14 }}>
              <Avatar name="Mariela Tarqui" size={32} />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Mariela Tarqui</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Gerente · Trans Andino Sur</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, maxWidth: 460 }}>
            {[
              { v: "12,400+", l: "Boletos / mes" },
              { v: "42", l: "Rutas activas" },
              { v: "99.7%", l: "Uptime" },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", fontFamily: "var(--font-mono)" }}>{s.v}</div>
                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

window.Login = Login;
