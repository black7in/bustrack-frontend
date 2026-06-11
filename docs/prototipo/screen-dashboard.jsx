/* BusTrack BO — Dashboard */

const KPI_DATA = [
  { id: "tickets", label: "Boletos vendidos hoy", value: "342", unit: "", trend: +8.2, trendLabel: "vs ayer", icon: "Ticket", color: "var(--brand-700)" },
  { id: "revenue", label: "Ingresos del día", value: "Bs 28,940", unit: "", trend: +12.4, trendLabel: "vs ayer", icon: "Money", color: "var(--ok-700)" },
  { id: "trips",   label: "Viajes activos",       value: "14", unit: "/ 22 prog.", trend: -2.0, trendLabel: "vs ayer", icon: "Route", color: "var(--accent-600)" },
  { id: "occ",     label: "Ocupación promedio",   value: "78%", unit: "", trend: +4.1, trendLabel: "últ. 7 días", icon: "Users", color: "var(--brand-600)" },
];

const WEEK = [
  { d: "Lun", v: 18200 }, { d: "Mar", v: 21400 }, { d: "Mié", v: 19850 },
  { d: "Jue", v: 24300 }, { d: "Vie", v: 31600 }, { d: "Sáb", v: 36800 }, { d: "Dom", v: 28940, today: true },
];

const TODAY_TRIPS = [
  { code: "LP-CB-07:00", from: "La Paz", to: "Cochabamba", dep: "07:00", bus: "BTB-104", driver: "Edwin Mamani", occ: 42, cap: 44, status: "in_route", eta: "Llegando 13:45" },
  { code: "LP-SC-08:30", from: "La Paz", to: "Santa Cruz", dep: "08:30", bus: "BTB-211", driver: "Roxana Vargas", occ: 38, cap: 50, status: "in_route", eta: "Curva del Sillar" },
  { code: "LP-OR-10:15", from: "La Paz", to: "Oruro",     dep: "10:15", bus: "BTB-058", driver: "Marco Choque", occ: 50, cap: 50, status: "boarding", eta: "Embarcando" },
  { code: "LP-SU-12:00", from: "La Paz", to: "Sucre",     dep: "12:00", bus: "BTB-176", driver: "Luis Quispe",  occ: 27, cap: 44, status: "scheduled", eta: "En 1 h 12 m" },
  { code: "LP-PT-13:30", from: "La Paz", to: "Potosí",    dep: "13:30", bus: "BTB-092", driver: "Sara Apaza",   occ: 44, cap: 50, status: "scheduled", eta: "En 2 h 42 m" },
  { code: "LP-TJ-14:45", from: "La Paz", to: "Tarija",    dep: "14:45", bus: "BTB-133", driver: "Iván Flores",  occ: 12, cap: 44, status: "delay", eta: "+ 25 min" },
  { code: "LP-CB-16:00", from: "La Paz", to: "Cochabamba",dep: "16:00", bus: "BTB-104", driver: "Edwin Mamani", occ: 8,  cap: 44, status: "scheduled", eta: "En 3 h 57 m" },
];

const STATUS = {
  in_route:   { cls: "badge-info",  label: "En ruta" },
  boarding:   { cls: "badge-warn",  label: "Embarcando" },
  scheduled:  { cls: "badge-neutral", label: "Programado" },
  delay:      { cls: "badge-err",   label: "Demorado" },
  completed:  { cls: "badge-ok",    label: "Completado" },
};

const SparkBar = ({ data, height = 180 }) => {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height, padding: "8px 4px 0" }}>
      {data.map((d, i) => {
        const h = (d.v / max) * (height - 32);
        const isToday = d.today;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: isToday ? "var(--ink-800)" : "var(--ink-400)", fontWeight: isToday ? 700 : 500 }}>
              {(d.v / 1000).toFixed(1)}k
            </div>
            <div style={{ width: "100%", height: h, borderRadius: "6px 6px 0 0",
              background: isToday
                ? "linear-gradient(180deg, var(--accent-500), var(--accent-600))"
                : "linear-gradient(180deg, var(--brand-600), var(--brand-700))",
              opacity: isToday ? 1 : 0.85,
              boxShadow: isToday ? "0 8px 14px rgba(232,146,32,0.28)" : "none",
            }} />
            <div style={{ fontSize: 11.5, color: isToday ? "var(--ink-800)" : "var(--ink-500)", fontWeight: isToday ? 700 : 500 }}>{d.d}</div>
          </div>
        );
      })}
    </div>
  );
};

const KpiCard = ({ kpi }) => {
  const Ico = I[kpi.icon];
  const up = kpi.trend >= 0;
  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="h-stack" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "var(--brand-050)",
          color: kpi.color,
          display: "grid", placeItems: "center",
        }}>
          <Ico size={18} stroke={1.8} />
        </div>
        <span className={`badge ${up ? "badge-ok" : "badge-err"}`} style={{ gap: 3 }}>
          {up ? <I.ArrowUp size={11} stroke={2.2} /> : <I.ArrowDown size={11} stroke={2.2} />}
          {up ? "+" : ""}{kpi.trend}%
        </span>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-500)", fontWeight: 500, marginBottom: 4 }}>{kpi.label}</div>
      <div className="h-stack" style={{ gap: 8, alignItems: "baseline" }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: "var(--ink-900)", letterSpacing: "-0.02em", fontFamily: "var(--font-mono)", fontFeatureSettings: "'tnum' 1" }}>
          {kpi.value}
        </div>
        {kpi.unit && <span style={{ fontSize: 12, color: "var(--ink-500)" }}>{kpi.unit}</span>}
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 6 }}>{kpi.trendLabel}</div>
    </div>
  );
};

const OccupancyBar = ({ occ, cap }) => {
  const pct = (occ / cap) * 100;
  let cls = "var(--ok-600)";
  if (pct >= 95) cls = "var(--err-600)";
  else if (pct >= 80) cls = "var(--warn-500)";
  return (
    <div style={{ width: 120 }}>
      <div className="h-stack" style={{ justifyContent: "space-between", marginBottom: 4, fontSize: 11.5 }}>
        <span className="mono" style={{ fontWeight: 600 }}>{occ}/{cap}</span>
        <span className="muted">{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 6, background: "var(--ink-150)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: cls, borderRadius: 3 }} />
      </div>
    </div>
  );
};

const Dashboard = ({ onNavigate }) => {
  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Welcome row */}
      <div className="h-stack" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="eyebrow">DOMINGO · 22 DE MAYO, 2026</div>
          <h2 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink-900)" }}>
            Buenas tardes, Carlos 👋
          </h2>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: 13.5 }}>Resumen de operaciones · Terminal La Paz</p>
        </div>
        <div className="h-stack" style={{ gap: 8 }}>
          <button className="btn btn-outline btn-sm">
            <I.Calendar size={14} /> Últimos 7 días <I.ChevronDown size={13} />
          </button>
          <button className="btn btn-outline btn-sm">
            <I.Download size={14} /> Exportar
          </button>
          <button className="btn btn-accent btn-sm" onClick={() => onNavigate && onNavigate("tickets")}>
            <I.Plus size={14} /> Vender boleto
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {KPI_DATA.map(k => <KpiCard key={k.id} kpi={k} />)}
      </div>

      {/* Chart + side panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="h-stack" style={{ justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>Ingresos por día</h3>
              <p className="muted" style={{ margin: "2px 0 0", fontSize: 12.5 }}>Última semana · Bs (miles)</p>
            </div>
            <div className="h-stack" style={{ gap: 6 }}>
              <button className="btn btn-ghost btn-sm" style={{ background: "var(--ink-100)" }}>Semana</button>
              <button className="btn btn-ghost btn-sm">Mes</button>
              <button className="btn btn-ghost btn-sm">Año</button>
            </div>
          </div>

          <div className="h-stack" style={{ gap: 28, marginBottom: 16, alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 11.5, color: "var(--ink-500)", fontWeight: 600, marginBottom: 2 }}>TOTAL SEMANA</div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink-900)", fontFamily: "var(--font-mono)" }}>Bs 181,090</div>
            </div>
            <span className="badge badge-ok">
              <I.ArrowUp size={11} stroke={2.2} /> +14.2% vs semana anterior
            </span>
          </div>

          <SparkBar data={WEEK} />
        </div>

        {/* Side: ocupación por ruta */}
        <div className="card" style={{ padding: 22 }}>
          <div className="h-stack" style={{ justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>Ocupación por ruta</h3>
              <p className="muted" style={{ margin: "2px 0 0", fontSize: 12.5 }}>Top 5 · hoy</p>
            </div>
            <button className="btn btn-ghost btn-sm">Ver todo <I.ChevronRight size={12} /></button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { r: "La Paz → Santa Cruz", v: 92, c: "var(--err-600)", n: "5 viajes" },
              { r: "La Paz → Cochabamba", v: 84, c: "var(--warn-500)", n: "8 viajes" },
              { r: "La Paz → Oruro", v: 76, c: "var(--brand-600)", n: "6 viajes" },
              { r: "La Paz → Sucre", v: 62, c: "var(--brand-600)", n: "3 viajes" },
              { r: "La Paz → Tarija", v: 41, c: "var(--ok-600)", n: "2 viajes" },
            ].map(row => (
              <div key={row.r}>
                <div className="h-stack" style={{ justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-800)" }}>{row.r}</span>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{row.v}%</span>
                </div>
                <div style={{ height: 8, background: "var(--ink-150)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${row.v}%`, background: row.c, borderRadius: 4 }} />
                </div>
                <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>{row.n}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today trips */}
      <div className="card">
        <div className="h-stack" style={{ justifyContent: "space-between", padding: "18px 22px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>Viajes del día</h3>
            <p className="muted" style={{ margin: "2px 0 0", fontSize: 12.5 }}>{TODAY_TRIPS.length} programados · {TODAY_TRIPS.filter(t => t.status === "in_route" || t.status === "boarding").length} en operación</p>
          </div>
          <div className="h-stack" style={{ gap: 8 }}>
            <button className="btn btn-outline btn-sm"><I.Filter size={13} /> Filtrar</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate && onNavigate("trips")}>Ver todos <I.ChevronRight size={12} /></button>
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>Código</th>
              <th>Ruta</th>
              <th>Salida</th>
              <th>Bus / Chofer</th>
              <th>Ocupación</th>
              <th>Estado</th>
              <th>ETA / Nota</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {TODAY_TRIPS.map(t => (
              <tr key={t.code}>
                <td><span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-700)" }}>{t.code}</span></td>
                <td>
                  <div className="h-stack" style={{ gap: 6 }}>
                    <span style={{ fontWeight: 600 }}>{t.from}</span>
                    <I.ArrowRight size={12} style={{ color: "var(--ink-400)" }} />
                    <span style={{ fontWeight: 600 }}>{t.to}</span>
                  </div>
                </td>
                <td><span className="mono" style={{ fontWeight: 600 }}>{t.dep}</span></td>
                <td>
                  <div style={{ lineHeight: 1.25 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{t.bus}</div>
                    <div className="muted" style={{ fontSize: 11.5 }}>{t.driver}</div>
                  </div>
                </td>
                <td><OccupancyBar occ={t.occ} cap={t.cap} /></td>
                <td><span className={`badge ${STATUS[t.status].cls}`}><span className="dot"/>{STATUS[t.status].label}</span></td>
                <td><span style={{ fontSize: 12.5, color: "var(--ink-700)" }}>{t.eta}</span></td>
                <td><button className="btn btn-ghost btn-icon"><I.More size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

window.Dashboard = Dashboard;
