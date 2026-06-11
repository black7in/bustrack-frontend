/* BusTrack BO — Shared shell pieces: Logo, Avatar, Sidebar, Header */

const Logo = ({ size = 28, variant = "light" }) => {
  const fg = variant === "dark" ? "#ffffff" : "var(--brand-800)";
  const accent = "var(--accent-500)";
  return (
    <div className="h-stack" style={{ gap: 10 }}>
      <div style={{
        width: size + 6, height: size + 6, borderRadius: 8,
        background: variant === "dark" ? "rgba(255,255,255,0.08)" : "var(--brand-800)",
        display: "grid", placeItems: "center",
        boxShadow: variant === "dark" ? "none" : "inset 0 -1px 0 rgba(0,0,0,0.15)",
      }}>
        <svg width={size - 4} height={size - 4} viewBox="0 0 24 24" fill="none">
          <rect x="3.5" y="6" width="17" height="11" rx="2.2" stroke="#fff" strokeWidth="1.7"/>
          <path d="M3.5 12h17" stroke="#fff" strokeWidth="1.7"/>
          <circle cx="8" cy="17.5" r="1.2" fill={accent}/>
          <circle cx="16" cy="17.5" r="1.2" fill={accent}/>
          <path d="M7 9h2M15 9h2" stroke={accent} strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ lineHeight: 1.05 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: fg, letterSpacing: "-0.02em" }}>
          BusTrack <span style={{ color: accent }}>BO</span>
        </div>
        <div style={{ fontSize: 10.5, color: variant === "dark" ? "rgba(255,255,255,0.55)" : "var(--ink-500)", letterSpacing: "0.06em", fontWeight: 600 }}>
          GESTIÓN DE FLOTA
        </div>
      </div>
    </div>
  );
};

const Avatar = ({ name = "?", src, size = 32, ring = false }) => {
  const initials = name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
  const colors = ["#0B2942", "#1E4E78", "#B26A0B", "#15803D", "#7C3AED", "#0E7490"];
  const c = colors[Math.abs([...name].reduce((a, ch) => a + ch.charCodeAt(0), 0)) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: src ? `center/cover url(${src})` : c,
      color: "#fff", fontWeight: 700, fontSize: size * 0.38,
      display: "grid", placeItems: "center",
      boxShadow: ring ? "0 0 0 2px var(--white), 0 0 0 3px var(--brand-600)" : "none",
      flexShrink: 0, letterSpacing: "-0.01em",
    }}>
      {!src && initials}
    </div>
  );
};

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "Dashboard" },
  { id: "tickets",   label: "Venta de Boletos", icon: "Ticket", badge: "12" },
  { id: "trips",     label: "Viajes", icon: "Route" },
  { id: "fleet",     label: "Flota", icon: "Bus" },
  { id: "drivers",   label: "Choferes", icon: "Driver" },
  { id: "routes",    label: "Rutas", icon: "MapPin" },
  { id: "pricing",   label: "Tarifas", icon: "Pricing" },
  { id: "reports",   label: "Reportes", icon: "Reports" },
];

const Sidebar = ({ active, onNavigate, variant = "dark" }) => {
  const isDark = variant === "dark";
  const bg = isDark ? "var(--brand-900)" : "var(--white)";
  const fg = isDark ? "rgba(255,255,255,0.85)" : "var(--ink-800)";
  const muted = isDark ? "rgba(255,255,255,0.4)" : "var(--ink-500)";
  const subtle = isDark ? "rgba(255,255,255,0.06)" : "var(--ink-100)";
  return (
    <aside className="sidebar" style={{
      background: bg,
      color: fg,
      display: "flex", flexDirection: "column",
      borderRight: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid var(--ink-200)",
    }}>
      <div style={{ padding: "20px 20px 16px" }}>
        <Logo variant={variant} />
      </div>

      <div style={{ padding: "0 12px 4px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          height: 36, padding: "0 10px",
          background: subtle,
          borderRadius: 8, cursor: "pointer",
          border: isDark ? "none" : "1px solid var(--ink-200)",
        }}>
          <I.Search size={15} stroke={1.7} style={{ color: isDark ? "currentColor" : "var(--ink-500)" }} />
          <span style={{ fontSize: 13, color: isDark ? "rgba(255,255,255,0.55)" : "var(--ink-400)" }}>Buscar…</span>
          <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: "var(--font-mono)",
            background: isDark ? "rgba(255,255,255,0.08)" : "var(--ink-150)",
            padding: "2px 6px", borderRadius: 4,
            color: isDark ? "rgba(255,255,255,0.6)" : "var(--ink-500)" }}>⌘K</span>
        </div>
      </div>

      <nav style={{ padding: "12px 12px", display: "flex", flexDirection: "column", gap: 2, flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 10.5, letterSpacing: "0.1em", fontWeight: 700,
          color: muted, padding: "8px 10px 6px" }}>OPERACIÓN</div>
        {NAV.slice(0, 5).map(item => <NavItem key={item.id} item={item} active={active === item.id} onClick={() => onNavigate(item.id)} variant={variant} />)}

        <div style={{ fontSize: 10.5, letterSpacing: "0.1em", fontWeight: 700,
          color: muted, padding: "16px 10px 6px" }}>CATÁLOGO</div>
        {NAV.slice(5).map(item => <NavItem key={item.id} item={item} active={active === item.id} onClick={() => onNavigate(item.id)} variant={variant} />)}
      </nav>

      <div style={{ padding: 12, borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid var(--ink-150)" }}>
        <div style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(232,146,32,0.15), rgba(232,146,32,0.05))"
            : "linear-gradient(135deg, var(--accent-100), #fff)",
          border: isDark ? "1px solid rgba(232,146,32,0.25)" : "1px solid var(--accent-400)",
          borderRadius: 10, padding: 12,
        }}>
          <div className="h-stack" style={{ gap: 8, marginBottom: 6 }}>
            <I.Star size={14} stroke={1.8} style={{ color: "var(--accent-600)" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? "#fff" : "var(--brand-800)" }}>Plan Empresa</span>
          </div>
          <div style={{ fontSize: 11.5, color: isDark ? "rgba(255,255,255,0.6)" : "var(--ink-600)", lineHeight: 1.4 }}>
            12 buses · 28 choferes activos · soporte 24/7
          </div>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ item, active, onClick, variant = "dark" }) => {
  const Ico = I[item.icon];
  const isDark = variant === "dark";
  const activeBg  = isDark ? "rgba(232,146,32,0.14)" : "var(--brand-050)";
  const idleColor = isDark ? "rgba(255,255,255,0.75)" : "var(--ink-700)";
  const activeColor = isDark ? "#fff" : "var(--brand-800)";
  const hoverBg = isDark ? "rgba(255,255,255,0.05)" : "var(--ink-100)";
  const iconIdle = isDark ? "rgba(255,255,255,0.7)" : "var(--ink-500)";
  const iconActive = isDark ? "var(--accent-400)" : "var(--accent-600)";
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10,
      height: 36, padding: "0 10px", borderRadius: 7,
      width: "100%", textAlign: "left",
      background: active ? activeBg : "transparent",
      color: active ? activeColor : idleColor,
      fontWeight: active ? 600 : 500, fontSize: 13.5,
      position: "relative", transition: "background 120ms",
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = hoverBg; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {active && <span style={{ position: "absolute", left: -12, top: 8, bottom: 8, width: 3, background: "var(--accent-500)", borderRadius: "0 3px 3px 0" }} />}
      <Ico size={16} stroke={active ? 1.9 : 1.7} style={{ color: active ? iconActive : iconIdle }} />
      <span>{item.label}</span>
      {item.badge && (
        <span style={{
          marginLeft: "auto",
          background: active ? "var(--accent-500)" : (isDark ? "rgba(255,255,255,0.1)" : "var(--ink-150)"),
          color: active ? "var(--brand-900)" : (isDark ? "rgba(255,255,255,0.8)" : "var(--ink-700)"),
          fontSize: 10.5, fontWeight: 700,
          padding: "1px 7px", borderRadius: 999,
          fontFamily: "var(--font-mono)",
        }}>{item.badge}</span>
      )}
    </button>
  );
};

const Header = ({ title, subtitle, actions, onLogout, user, breadcrumbs }) => {
  return (
    <header className="header" style={{
      background: "var(--white)",
      borderBottom: "1px solid var(--ink-200)",
      display: "flex", alignItems: "center",
      padding: "0 28px", gap: 16,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {breadcrumbs && (
          <div className="h-stack" style={{ gap: 6, marginBottom: 2 }}>
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                <span style={{ fontSize: 12, color: "var(--ink-500)" }}>{b}</span>
                {i < breadcrumbs.length - 1 && <I.ChevronRight size={11} style={{ color: "var(--ink-300)" }} />}
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="h-stack" style={{ gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--ink-900)", letterSpacing: "-0.015em" }}>{title}</h1>
          {subtitle && <span className="muted" style={{ fontSize: 13 }}>· {subtitle}</span>}
        </div>
      </div>

      <div className="h-stack" style={{ gap: 8 }}>
        {actions}
        <button className="btn btn-ghost btn-icon" title="Notificaciones" style={{ position: "relative" }}>
          <I.Bell size={17} />
          <span style={{ position: "absolute", top: 7, right: 8, width: 7, height: 7, borderRadius: "50%", background: "var(--err-600)", border: "1.5px solid #fff" }} />
        </button>
        <div style={{ width: 1, height: 24, background: "var(--ink-200)" }} />
        <div className="h-stack" style={{ gap: 10, paddingLeft: 4 }}>
          <Avatar name={user.name} size={32} />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)" }}>{user.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-500)" }}>{user.role}</div>
          </div>
          <button onClick={onLogout} className="btn btn-ghost btn-icon" title="Cerrar sesión">
            <I.Logout size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

window.Logo = Logo;
window.Avatar = Avatar;
window.Sidebar = Sidebar;
window.Header = Header;
