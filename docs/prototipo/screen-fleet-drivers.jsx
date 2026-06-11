/* BusTrack BO — Gestión de Flota & Choferes */

const BUSES = [
  { plate: "BTB-104", brand: "Mercedes-Benz", model: "O500RSD 2442", year: 2022, type: "Cama Ejecutivo", capacity: 44, km: 184230, status: "operating", driver: "Edwin Mamani", route: "LP-CB", color: "#1E4E78" },
  { plate: "BTB-211", brand: "Volvo", model: "9800 4x2", year: 2021, type: "Semi Cama", capacity: 50, km: 296850, status: "operating", driver: "Roxana Vargas", route: "LP-SC", color: "#0E7490" },
  { plate: "BTB-058", brand: "Scania", model: "K410 IB", year: 2023, type: "Cama Ejecutivo", capacity: 44, km: 92140, status: "boarding", driver: "Marco Choque", route: "LP-OR", color: "#15803D" },
  { plate: "BTB-176", brand: "Mercedes-Benz", model: "O500RSD 2742", year: 2024, type: "Cama Suite", capacity: 36, km: 41560, status: "operating", driver: "Sara Apaza", route: "LP-SU", color: "#7C3AED" },
  { plate: "BTB-092", brand: "Volvo", model: "9700 4x2", year: 2020, type: "Semi Cama", capacity: 50, km: 412300, status: "maintenance", driver: "—", route: "—", color: "#B26A0B" },
  { plate: "BTB-133", brand: "Scania", model: "F250", year: 2019, type: "Cama Ejecutivo", capacity: 44, km: 538090, status: "operating", driver: "Iván Flores", route: "LP-TJ", color: "#0B2942" },
  { plate: "BTB-217", brand: "Mercedes-Benz", model: "O500RS 1836", year: 2022, type: "Semi Cama", capacity: 50, km: 162400, status: "garage", driver: "—", route: "—", color: "#1E4E78" },
  { plate: "BTB-310", brand: "Volvo", model: "9800 6x2", year: 2024, type: "Cama Suite", capacity: 36, km: 18230, status: "garage", driver: "—", route: "—", color: "#0E7490" },
];

const BUS_STATUS = {
  operating:   { cls: "badge-info",    label: "En operación" },
  boarding:    { cls: "badge-warn",    label: "Embarcando" },
  maintenance: { cls: "badge-err",     label: "Mantenimiento" },
  garage:      { cls: "badge-neutral", label: "En garaje" },
};

const BusThumb = ({ bus, size = 56 }) => (
  <div style={{
    width: size, height: size * 0.66,
    borderRadius: 8, position: "relative", overflow: "hidden",
    background: `linear-gradient(135deg, ${bus.color} 0%, color-mix(in oklch, ${bus.color}, black 20%) 100%)`,
    boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.18)",
    flexShrink: 0,
  }}>
    <svg width="100%" height="100%" viewBox="0 0 56 36" style={{ position: "absolute", inset: 0 }}>
      <rect x="4" y="8" width="48" height="22" rx="3" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2"/>
      <path d="M4 18h48" stroke="rgba(255,255,255,0.85)" strokeWidth="1"/>
      <rect x="6" y="10" width="6" height="6" rx="1" fill="rgba(255,255,255,0.4)"/>
      <rect x="14" y="10" width="6" height="6" rx="1" fill="rgba(255,255,255,0.4)"/>
      <rect x="22" y="10" width="6" height="6" rx="1" fill="rgba(255,255,255,0.4)"/>
      <rect x="30" y="10" width="6" height="6" rx="1" fill="rgba(255,255,255,0.4)"/>
      <rect x="38" y="10" width="6" height="6" rx="1" fill="rgba(255,255,255,0.4)"/>
      <circle cx="12" cy="30" r="2.5" fill="#0B2942" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8"/>
      <circle cx="44" cy="30" r="2.5" fill="#0B2942" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8"/>
      <rect x="2" y="20" width="3" height="3" rx="0.5" fill="#E89220"/>
    </svg>
  </div>
);

const Fleet = ({ onOpenModal }) => {
  const [filter, setFilter] = React.useState("all");
  const filtered = filter === "all" ? BUSES : BUSES.filter(b => b.status === filter);
  const stats = {
    total: BUSES.length,
    operating: BUSES.filter(b => b.status === "operating" || b.status === "boarding").length,
    maintenance: BUSES.filter(b => b.status === "maintenance").length,
    garage: BUSES.filter(b => b.status === "garage").length,
  };

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Flota total", v: stats.total, c: "var(--brand-700)", icon: "Bus", k: "all" },
          { label: "En operación", v: stats.operating, c: "var(--ok-600)", icon: "Route", k: "operating" },
          { label: "Mantenimiento", v: stats.maintenance, c: "var(--err-600)", icon: "Settings", k: "maintenance" },
          { label: "En garaje", v: stats.garage, c: "var(--ink-500)", icon: "Bus", k: "garage" },
        ].map(s => {
          const Ico = I[s.icon];
          const active = filter === s.k;
          return (
            <button key={s.label} onClick={() => setFilter(s.k)} className="card" style={{
              padding: 16, textAlign: "left",
              borderColor: active ? s.c : "var(--ink-200)",
              borderWidth: active ? 1.5 : 1,
              boxShadow: active ? `0 0 0 3px color-mix(in oklch, ${s.c}, white 80%)` : "var(--shadow-sm)",
            }}>
              <div className="h-stack" style={{ justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-600)" }}>{s.label}</span>
                <Ico size={16} style={{ color: s.c }} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", fontFamily: "var(--font-mono)", color: "var(--ink-900)" }}>
                {s.v} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-400)" }}>buses</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="card">
        <div className="h-stack" style={{ justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--ink-150)" }}>
          <div className="h-stack" style={{ gap: 10 }}>
            <div style={{ position: "relative" }}>
              <I.Search size={14} style={{ position: "absolute", left: 10, top: 9, color: "var(--ink-400)" }} />
              <input className="input" placeholder="Buscar por placa, marca…" style={{ height: 32, paddingLeft: 32, fontSize: 12.5, width: 260 }} />
            </div>
            <button className="btn btn-outline btn-sm"><I.Filter size={13} /> Tipo</button>
            <button className="btn btn-outline btn-sm"><I.Filter size={13} /> Año</button>
          </div>
          <div className="h-stack" style={{ gap: 8 }}>
            <button className="btn btn-outline btn-sm"><I.Download size={13} /> Exportar</button>
            <button className="btn btn-accent btn-sm" onClick={onOpenModal}><I.Plus size={13} /> Registrar bus</button>
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>Bus</th>
              <th>Marca & Modelo</th>
              <th>Tipo</th>
              <th>Cap.</th>
              <th>Kilometraje</th>
              <th>Chofer actual</th>
              <th>Ruta</th>
              <th>Estado</th>
              <th style={{ width: 110 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.plate}>
                <td>
                  <div className="h-stack" style={{ gap: 12 }}>
                    <BusThumb bus={b} />
                    <div style={{ lineHeight: 1.25 }}>
                      <div className="mono" style={{ fontWeight: 700, fontSize: 13, color: "var(--ink-900)" }}>{b.plate}</div>
                      <div className="muted" style={{ fontSize: 11 }}>ID #{b.plate.split("-")[1]}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ lineHeight: 1.25 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{b.brand}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{b.model} · {b.year}</div>
                  </div>
                </td>
                <td><span style={{ fontSize: 12.5 }}>{b.type}</span></td>
                <td><span className="mono" style={{ fontWeight: 600 }}>{b.capacity}</span></td>
                <td><span className="mono" style={{ fontWeight: 600 }}>{b.km.toLocaleString()}</span> <span className="muted" style={{ fontSize: 11 }}>km</span></td>
                <td>{b.driver === "—" ? <span className="muted">—</span> : (
                  <div className="h-stack" style={{ gap: 8 }}>
                    <Avatar name={b.driver} size={26} />
                    <span style={{ fontSize: 12.5 }}>{b.driver}</span>
                  </div>
                )}</td>
                <td>{b.route === "—" ? <span className="muted">—</span> :
                  <span className="mono" style={{ fontSize: 12, fontWeight: 600, padding: "3px 7px", background: "var(--ink-100)", borderRadius: 4, color: "var(--ink-700)" }}>{b.route}</span>
                }</td>
                <td><span className={`badge ${BUS_STATUS[b.status].cls}`}><span className="dot"/>{BUS_STATUS[b.status].label}</span></td>
                <td>
                  <div className="h-stack" style={{ gap: 2 }}>
                    <button className="btn btn-ghost btn-icon" title="Ver"><I.Eye size={15} /></button>
                    <button className="btn btn-ghost btn-icon" title="Editar"><I.Edit size={15} /></button>
                    <button className="btn btn-ghost btn-icon" title="Desactivar" style={{ color: "var(--err-600)" }}><I.Power size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination total={filtered.length} />
      </div>
    </div>
  );
};

const Pagination = ({ total }) => (
  <div className="h-stack" style={{ justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid var(--ink-150)" }}>
    <span className="muted" style={{ fontSize: 12.5 }}>Mostrando 1–{total} de {total} resultados</span>
    <div className="h-stack" style={{ gap: 4 }}>
      <button className="btn btn-ghost btn-icon" disabled style={{ opacity: 0.4 }}><I.ChevronLeft size={14} /></button>
      {[1, 2, 3].map((n, i) => (
        <button key={n} className="btn btn-ghost btn-sm" style={{
          height: 32, width: 32, justifyContent: "center", padding: 0,
          background: i === 0 ? "var(--brand-800)" : "transparent",
          color: i === 0 ? "#fff" : "var(--ink-700)",
          fontWeight: 600,
        }}>{n}</button>
      ))}
      <span style={{ color: "var(--ink-400)" }}>…</span>
      <button className="btn btn-ghost btn-sm" style={{ height: 32, width: 32, justifyContent: "center", padding: 0 }}>12</button>
      <button className="btn btn-ghost btn-icon"><I.ChevronRight size={14} /></button>
    </div>
  </div>
);

/* ===== Drivers ===== */

const DRIVERS = [
  { name: "Edwin Mamani Condori", ci: "5478921 LP", lic: "C-PROF", licExp: "2028-03-12", phone: "+591 71234567", years: 12, trips: 1842, rating: 4.9, status: "available", bus: "BTB-104" },
  { name: "Roxana Vargas Cruz",   ci: "6892143 CB", lic: "C-PROF", licExp: "2027-08-04", phone: "+591 72345678", years: 8,  trips: 1124, rating: 4.8, status: "on_trip", bus: "BTB-211" },
  { name: "Marco Choque Apaza",   ci: "4521876 LP", lic: "C-PROF", licExp: "2026-11-21", phone: "+591 73456789", years: 15, trips: 2310, rating: 4.7, status: "on_trip", bus: "BTB-058" },
  { name: "Sara Apaza Mendoza",   ci: "7891234 OR", lic: "C-PROF", licExp: "2029-01-15", phone: "+591 74567890", years: 6,  trips: 612,  rating: 4.9, status: "available", bus: "BTB-176" },
  { name: "Luis Quispe Tarqui",   ci: "5012348 SC", lic: "C-PROF", licExp: "2027-05-30", phone: "+591 75678901", years: 10, trips: 1421, rating: 4.6, status: "rest", bus: "—" },
  { name: "Iván Flores Choque",   ci: "6234890 PT", lic: "C-PROF", licExp: "2026-06-10", phone: "+591 76789012", years: 14, trips: 2018, rating: 4.8, status: "on_trip", bus: "BTB-133" },
  { name: "María Huanca Quispe",  ci: "5678912 LP", lic: "C-PROF", licExp: "2026-02-28", phone: "+591 77890123", years: 4,  trips: 314,  rating: 4.5, status: "license_warn", bus: "—" },
  { name: "Pedro Mendoza Lima",   ci: "4123890 CB", lic: "C-PROF", licExp: "2028-09-19", phone: "+591 78901234", years: 9,  trips: 1287, rating: 4.7, status: "rest", bus: "—" },
];

const DRIVER_STATUS = {
  available:    { cls: "badge-ok",      label: "Disponible" },
  on_trip:      { cls: "badge-info",    label: "En viaje" },
  rest:         { cls: "badge-neutral", label: "Descanso" },
  license_warn: { cls: "badge-warn",    label: "Licencia por vencer" },
  inactive:     { cls: "badge-err",     label: "Inactivo" },
};

const Drivers = ({ onOpenModal }) => {
  const stats = {
    total: DRIVERS.length,
    avail: DRIVERS.filter(d => d.status === "available").length,
    trip: DRIVERS.filter(d => d.status === "on_trip").length,
    warn: DRIVERS.filter(d => d.status === "license_warn").length,
  };
  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Choferes activos", v: stats.total, c: "var(--brand-700)" },
          { label: "Disponibles",       v: stats.avail, c: "var(--ok-600)" },
          { label: "En viaje",          v: stats.trip, c: "var(--accent-600)" },
          { label: "Licencias por vencer", v: stats.warn, c: "var(--warn-600)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-600)", marginBottom: 6 }}>{s.label}</div>
            <div className="h-stack" style={{ gap: 8, alignItems: "baseline" }}>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", fontFamily: "var(--font-mono)", color: s.c }}>{s.v}</div>
              <div className="muted" style={{ fontSize: 11.5 }}>choferes</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="h-stack" style={{ justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--ink-150)" }}>
          <div className="h-stack" style={{ gap: 10 }}>
            <div style={{ position: "relative" }}>
              <I.Search size={14} style={{ position: "absolute", left: 10, top: 9, color: "var(--ink-400)" }} />
              <input className="input" placeholder="Buscar por nombre, CI…" style={{ height: 32, paddingLeft: 32, fontSize: 12.5, width: 260 }} />
            </div>
            <button className="btn btn-outline btn-sm"><I.Filter size={13} /> Estado</button>
            <button className="btn btn-outline btn-sm"><I.Filter size={13} /> Licencia</button>
          </div>
          <div className="h-stack" style={{ gap: 8 }}>
            <button className="btn btn-outline btn-sm"><I.Download size={13} /> Exportar</button>
            <button className="btn btn-accent btn-sm" onClick={onOpenModal}><I.Plus size={13} /> Registrar chofer</button>
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>Chofer</th>
              <th>CI</th>
              <th>Licencia</th>
              <th>Vencimiento</th>
              <th>Experiencia</th>
              <th>Viajes</th>
              <th>Cal.</th>
              <th>Bus asign.</th>
              <th>Estado</th>
              <th style={{ width: 110 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {DRIVERS.map(d => {
              const exp = new Date(d.licExp);
              const months = (exp - new Date()) / (1000 * 60 * 60 * 24 * 30);
              const expColor = months < 6 ? "var(--warn-600)" : months < 12 ? "var(--ink-700)" : "var(--ink-700)";
              return (
                <tr key={d.ci}>
                  <td>
                    <div className="h-stack" style={{ gap: 12 }}>
                      <Avatar name={d.name} size={36} />
                      <div style={{ lineHeight: 1.25 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                        <div className="muted" style={{ fontSize: 11.5 }}>{d.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="mono" style={{ fontSize: 12.5 }}>{d.ci}</span></td>
                  <td><span style={{ fontSize: 12.5, padding: "2px 8px", background: "var(--brand-050)", color: "var(--brand-700)", borderRadius: 4, fontWeight: 600 }}>{d.lic}</span></td>
                  <td>
                    <div className="h-stack" style={{ gap: 6, color: expColor }}>
                      {months < 6 && <I.Bell size={12} stroke={1.8} />}
                      <span className="mono" style={{ fontSize: 12.5, fontWeight: 600 }}>{d.licExp}</span>
                    </div>
                  </td>
                  <td><span style={{ fontSize: 12.5 }}>{d.years} años</span></td>
                  <td><span className="mono" style={{ fontWeight: 600 }}>{d.trips.toLocaleString()}</span></td>
                  <td>
                    <div className="h-stack" style={{ gap: 4 }}>
                      <I.Star size={12} style={{ color: "var(--accent-500)" }} />
                      <span className="mono" style={{ fontWeight: 600 }}>{d.rating}</span>
                    </div>
                  </td>
                  <td>{d.bus === "—" ? <span className="muted">—</span> :
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600, padding: "3px 7px", background: "var(--ink-100)", borderRadius: 4, color: "var(--ink-700)" }}>{d.bus}</span>
                  }</td>
                  <td><span className={`badge ${DRIVER_STATUS[d.status].cls}`}><span className="dot"/>{DRIVER_STATUS[d.status].label}</span></td>
                  <td>
                    <div className="h-stack" style={{ gap: 2 }}>
                      <button className="btn btn-ghost btn-icon" title="Ver"><I.Eye size={15} /></button>
                      <button className="btn btn-ghost btn-icon" title="Editar"><I.Edit size={15} /></button>
                      <button className="btn btn-ghost btn-icon" title="Desactivar" style={{ color: "var(--err-600)" }}><I.Power size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <Pagination total={DRIVERS.length} />
      </div>
    </div>
  );
};

window.Fleet = Fleet;
window.Drivers = Drivers;
