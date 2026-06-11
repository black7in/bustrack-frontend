/* BusTrack BO — App root */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#0B2942",
  "accentColor": "#E89220",
  "density": "comfortable",
  "sidebarStyle": "dark",
  "startScreen": "dashboard"
}/*EDITMODE-END*/;

const HEADER_BY_SCREEN = {
  dashboard: { title: "Dashboard", subtitle: "Resumen general", breadcrumbs: ["Operación", "Dashboard"] },
  tickets:   { title: "Venta de Boletos", subtitle: "Buscar y emitir", breadcrumbs: ["Operación", "Venta de Boletos"] },
  trips:     { title: "Viajes", subtitle: "Programación y operación", breadcrumbs: ["Operación", "Viajes"] },
  fleet:     { title: "Flota", subtitle: "Buses registrados", breadcrumbs: ["Operación", "Flota"] },
  drivers:   { title: "Choferes", subtitle: "Conductores profesionales", breadcrumbs: ["Operación", "Choferes"] },
  routes:    { title: "Rutas", subtitle: "Origen, destino y paradas", breadcrumbs: ["Catálogo", "Rutas"] },
  pricing:   { title: "Tarifas", subtitle: "Precios y promociones", breadcrumbs: ["Catálogo", "Tarifas"] },
  reports:   { title: "Reportes", subtitle: "Indicadores y exportación", breadcrumbs: ["Catálogo", "Reportes"] },
};

const USER = { name: "Carlos Vela Q.", role: "Administrador · La Paz" };

const App = () => {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [authed, setAuthed] = React.useState(false);
  const [screen, setScreen] = React.useState(t.startScreen || "dashboard");
  const [busModalOpen, setBusModalOpen] = React.useState(false);
  const [driverModalOpen, setDriverModalOpen] = React.useState(false);

  // Apply tweaks
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand-800", t.primaryColor);
    root.style.setProperty("--brand-900", shade(t.primaryColor, -12));
    root.style.setProperty("--brand-700", shade(t.primaryColor, 10));
    root.style.setProperty("--brand-600", shade(t.primaryColor, 22));
    root.style.setProperty("--accent-500", t.accentColor);
    root.style.setProperty("--accent-600", shade(t.accentColor, -10));
    root.style.setProperty("--accent-400", shade(t.accentColor, 12));

    // density
    if (t.density === "compact") {
      root.style.setProperty("--sidebar-w", "224px");
      root.style.setProperty("--header-h", "56px");
    } else if (t.density === "spacious") {
      root.style.setProperty("--sidebar-w", "264px");
      root.style.setProperty("--header-h", "72px");
    } else {
      root.style.setProperty("--sidebar-w", "248px");
      root.style.setProperty("--header-h", "64px");
    }
  }, [t.primaryColor, t.accentColor, t.density]);

  const screenContent = {
    dashboard: <Dashboard onNavigate={setScreen} />,
    tickets:   <Tickets />,
    trips:     <Trips />,
    fleet:     <Fleet onOpenModal={() => setBusModalOpen(true)} />,
    drivers:   <Drivers onOpenModal={() => setDriverModalOpen(true)} />,
    routes:    <Routes />,
    pricing:   <Pricing />,
    reports:   <Reports />,
  }[screen];

  if (!authed) {
    return (
      <>
        <Login onLogin={() => setAuthed(true)} />
        <TweaksPanelWrapper t={t} setTweak={setTweak} />
      </>
    );
  }

  return (
    <>
      <div className="app" data-screen-label={`02 ${HEADER_BY_SCREEN[screen].title}`}>
        <Sidebar active={screen} onNavigate={setScreen} variant={t.sidebarStyle} />
        <Header
          {...HEADER_BY_SCREEN[screen]}
          user={USER}
          onLogout={() => setAuthed(false)}
        />
        <main className="main">{screenContent}</main>
      </div>

      <RegisterBusModal open={busModalOpen} onClose={() => setBusModalOpen(false)} />
      <RegisterDriverModal open={driverModalOpen} onClose={() => setDriverModalOpen(false)} />

      <TweaksPanelWrapper t={t} setTweak={setTweak} />
    </>
  );
};

function shade(hex, percent) {
  // percent: -100..100 (negative = darker, positive = lighter)
  const n = parseInt(hex.replace("#", ""), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = percent / 100;
  if (f >= 0) {
    r = Math.round(r + (255 - r) * f);
    g = Math.round(g + (255 - g) * f);
    b = Math.round(b + (255 - b) * f);
  } else {
    r = Math.round(r * (1 + f));
    g = Math.round(g * (1 + f));
    b = Math.round(b * (1 + f));
  }
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

const TweaksPanelWrapper = ({ t, setTweak }) => (
  <TweaksPanel title="Tweaks · BusTrack BO">
    <TweakSection label="Identidad de marca">

      <TweakColor
        label="Color primario"
        value={t.primaryColor}
        onChange={v => setTweak("primaryColor", v)}
        options={["#0B2942", "#0F3D5C", "#11233A", "#0E4B5C", "#2A2F4A"]}
      />
      <TweakColor
        label="Color de acento"
        value={t.accentColor}
        onChange={v => setTweak("accentColor", v)}
        options={["#E89220", "#F59E0B", "#DC8B2A", "#B45309", "#1F8A5B"]}
      />
    </TweakSection>

    <TweakSection label="Apariencia">
      <TweakRadio
        label="Estilo del sidebar"
        value={t.sidebarStyle}
        onChange={v => setTweak("sidebarStyle", v)}
        options={[
          { value: "dark",  label: "Oscuro" },
          { value: "light", label: "Claro" },
        ]}
      />
      <TweakSelect
        label="Densidad"
        value={t.density}
        onChange={v => setTweak("density", v)}
        options={[
          { value: "compact", label: "Compacta" },
          { value: "comfortable", label: "Cómoda (default)" },
          { value: "spacious", label: "Espaciosa" },
        ]}
      />
    </TweakSection>

    <TweakSection label="Navegación rápida">
      <TweakSelect
        label="Pantalla inicial al abrir"
        value={t.startScreen}
        onChange={v => setTweak("startScreen", v)}
        options={[
          { value: "dashboard", label: "Dashboard" },
          { value: "tickets",   label: "Venta de Boletos" },
          { value: "fleet",     label: "Flota" },
          { value: "drivers",   label: "Choferes" },
        ]}
      />
    </TweakSection>
  </TweaksPanel>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
