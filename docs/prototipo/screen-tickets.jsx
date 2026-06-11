/* BusTrack BO — Venta de boletos */

const TRIPS_SEARCH = [
  { id: "t1", code: "LP-CB-07:00", from: "La Paz", to: "Cochabamba", dep: "07:00", arr: "14:30", dur: "7h 30m", bus: "BTB-104 · Cama Ejecutivo", driver: "Edwin Mamani", available: 28, total: 44, price: 95, services: ["Wifi", "AC", "Bath"] },
  { id: "t2", code: "LP-CB-10:30", from: "La Paz", to: "Cochabamba", dep: "10:30", arr: "18:00", dur: "7h 30m", bus: "BTB-211 · Semi Cama",   driver: "Roxana Vargas", available: 12, total: 50, price: 75, services: ["Wifi", "AC"] },
  { id: "t3", code: "LP-CB-16:00", from: "La Paz", to: "Cochabamba", dep: "16:00", arr: "23:30", dur: "7h 30m", bus: "BTB-058 · Cama Ejecutivo", driver: "Marco Choque", available: 36, total: 44, price: 95, services: ["Wifi", "AC", "Bath", "TV"] },
  { id: "t4", code: "LP-CB-22:00", from: "La Paz", to: "Cochabamba", dep: "22:00", arr: "05:30", dur: "7h 30m", bus: "BTB-176 · Cama Suite", driver: "Sara Apaza", available: 8, total: 36, price: 130, services: ["Wifi", "AC", "Bath", "TV"] },
];

// Seat plan: 11 rows x 4 seats with aisle
// Status: free / occupied / reserved / selected
const buildSeatPlan = (seed = 1) => {
  const rand = mulberry(seed);
  const rows = 11;
  const layout = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < 4; c++) {
      const v = rand();
      let status = "free";
      if (v < 0.40) status = "occupied";
      else if (v < 0.50) status = "reserved";
      row.push({ id: `${r+1}${"ABCD"[c]}`, status });
    }
    layout.push(row);
  }
  return layout;
};

function mulberry(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const SERVICE_ICONS = { Wifi: "Wifi", AC: "Snow", Bath: "Driver", TV: "Reports" };

const SeatLegend = () => (
  <div className="h-stack" style={{ gap: 16, fontSize: 11.5 }}>
    {[
      { c: "var(--ok-600)", bg: "var(--ok-050)", label: "Disponible" },
      { c: "var(--accent-500)", bg: "var(--accent-100)", label: "Seleccionado" },
      { c: "var(--warn-500)", bg: "var(--warn-100)", label: "Reservado" },
      { c: "var(--err-600)", bg: "var(--err-100)", label: "Ocupado" },
    ].map(l => (
      <div key={l.label} className="h-stack" style={{ gap: 6 }}>
        <span style={{ width: 14, height: 14, borderRadius: 4, background: l.bg, border: `1.5px solid ${l.c}` }} />
        <span style={{ color: "var(--ink-600)", fontWeight: 500 }}>{l.label}</span>
      </div>
    ))}
  </div>
);

const Seat = ({ s, onClick }) => {
  const map = {
    free:      { bg: "var(--ok-050)",     border: "var(--ok-600)",     color: "var(--ok-700)",   cursor: "pointer" },
    selected:  { bg: "var(--accent-500)", border: "var(--accent-700)", color: "#fff",            cursor: "pointer" },
    reserved:  { bg: "var(--warn-100)",   border: "var(--warn-500)",   color: "var(--warn-700)", cursor: "not-allowed" },
    occupied:  { bg: "var(--err-100)",    border: "var(--err-600)",    color: "var(--err-700)",  cursor: "not-allowed" },
  };
  const m = map[s.status];
  return (
    <button
      onClick={() => (s.status === "free" || s.status === "selected") && onClick(s)}
      disabled={s.status === "occupied" || s.status === "reserved"}
      style={{
        width: 42, height: 42, borderRadius: "8px 8px 4px 4px",
        background: m.bg, border: `1.5px solid ${m.border}`, color: m.color,
        fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-mono)",
        cursor: m.cursor,
        position: "relative",
        boxShadow: s.status === "selected" ? "0 4px 12px rgba(232,146,32,0.35)" : "inset 0 -2px 0 rgba(0,0,0,0.06)",
        transition: "transform 100ms",
      }}
      onMouseEnter={e => e.currentTarget.style.transform = (s.status === "free" || s.status === "selected") ? "translateY(-1px)" : "none"}
      onMouseLeave={e => e.currentTarget.style.transform = "none"}
    >
      {s.id}
      {/* Headrest line */}
      <span style={{ position: "absolute", top: 4, left: 6, right: 6, height: 2, background: "currentColor", opacity: 0.35, borderRadius: 1 }} />
    </button>
  );
};

const Tickets = () => {
  const [stage, setStage] = React.useState("results"); // results | seating | passenger
  const [selectedTrip, setSelectedTrip] = React.useState(TRIPS_SEARCH[0]);
  const [seats, setSeats] = React.useState(buildSeatPlan(7));
  const [selectedSeats, setSelectedSeats] = React.useState([]);
  const [passenger, setPassenger] = React.useState({ first: "", last: "", ci: "", phone: "", email: "" });

  const toggleSeat = (s) => {
    setSeats(prev => prev.map(row => row.map(c => {
      if (c.id === s.id) {
        const next = c.status === "selected" ? "free" : "selected";
        return { ...c, status: next };
      }
      return c;
    })));
    setSelectedSeats(prev => {
      const has = prev.includes(s.id);
      if (has) return prev.filter(x => x !== s.id);
      if (prev.length >= 4) return prev;
      return [...prev, s.id];
    });
  };

  const total = selectedSeats.length * selectedTrip.price;

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Search bar */}
      <div className="card" style={{ padding: 20 }}>
        <div className="h-stack" style={{ marginBottom: 14, gap: 10 }}>
          <I.Ticket size={18} style={{ color: "var(--accent-600)" }} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>Buscar viajes disponibles</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
          <div>
            <label className="field-label">Origen</label>
            <div style={{ position: "relative" }}>
              <I.MapPin size={15} style={{ position: "absolute", left: 12, top: 12, color: "var(--ink-400)" }} />
              <input className="input" defaultValue="La Paz" style={{ paddingLeft: 36 }} />
            </div>
          </div>
          <div>
            <label className="field-label">Destino</label>
            <div style={{ position: "relative" }}>
              <I.MapPin size={15} style={{ position: "absolute", left: 12, top: 12, color: "var(--accent-600)" }} />
              <input className="input" defaultValue="Cochabamba" style={{ paddingLeft: 36 }} />
            </div>
          </div>
          <div>
            <label className="field-label">Fecha</label>
            <div style={{ position: "relative" }}>
              <I.Calendar size={15} style={{ position: "absolute", left: 12, top: 12, color: "var(--ink-400)" }} />
              <input className="input" type="text" defaultValue="22 Mayo 2026" style={{ paddingLeft: 36 }} />
            </div>
          </div>
          <div>
            <label className="field-label">Pasajeros</label>
            <select className="input" defaultValue="1">
              <option>1 pasajero</option><option>2 pasajeros</option><option>3 pasajeros</option><option>4 pasajeros</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ height: 40 }}>
            <I.Search size={15} /> Buscar
          </button>
        </div>

        <div className="h-stack" style={{ gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--ink-200)" }}>
          <span style={{ fontSize: 12, color: "var(--ink-500)", fontWeight: 600 }}>Filtros:</span>
          {["Cama Ejecutivo", "Semi Cama", "Salida AM", "Salida PM", "Con WiFi"].map(f => (
            <button key={f} className="btn btn-ghost btn-sm" style={{ height: 28, padding: "0 10px", background: "var(--ink-100)", fontWeight: 500, color: "var(--ink-700)", fontSize: 12 }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16, alignItems: "start" }}>
        {/* Left col: Trip results + Seat plan */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Trip results */}
          <div className="card">
            <div className="h-stack" style={{ justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--ink-150)" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>4 viajes disponibles</h3>
                <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>La Paz → Cochabamba · Vie 22 Mayo</p>
              </div>
              <button className="btn btn-ghost btn-sm"><I.Sort size={13} /> Ordenar por: Salida</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {TRIPS_SEARCH.map(t => {
                const active = selectedTrip.id === t.id;
                return (
                  <button key={t.id} onClick={() => { setSelectedTrip(t); setSeats(buildSeatPlan(parseInt(t.id.slice(1)) * 31)); setSelectedSeats([]); }}
                    style={{
                      display: "block", textAlign: "left", padding: "16px 20px",
                      borderBottom: "1px solid var(--ink-150)",
                      background: active ? "var(--brand-050)" : "var(--white)",
                      borderLeft: active ? "3px solid var(--accent-500)" : "3px solid transparent",
                    }}>
                    <div className="h-stack" style={{ gap: 20 }}>
                      <div style={{ width: 140 }}>
                        <div className="h-stack" style={{ gap: 6 }}>
                          <span className="mono" style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>{t.dep}</span>
                          <I.ArrowRight size={13} style={{ color: "var(--ink-400)" }} />
                          <span className="mono" style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>{t.arr}</span>
                        </div>
                        <div className="h-stack" style={{ gap: 5, marginTop: 4 }}>
                          <I.Clock size={11} style={{ color: "var(--ink-400)" }} />
                          <span className="muted" style={{ fontSize: 11.5 }}>{t.dur}</span>
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{t.bus}</div>
                        <div className="h-stack" style={{ gap: 8, marginTop: 4 }}>
                          {t.services.map(s => {
                            const Ico = I[SERVICE_ICONS[s]] || I.Check;
                            return (
                              <div key={s} className="h-stack" style={{ gap: 3 }}>
                                <Ico size={12} style={{ color: "var(--ink-500)" }} />
                                <span className="muted" style={{ fontSize: 11.5 }}>{s === "Bath" ? "Baño" : s === "AC" ? "A/C" : s}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="muted" style={{ fontSize: 11, marginBottom: 2 }}>Disponibles</div>
                        <div className="h-stack" style={{ gap: 4, justifyContent: "flex-end" }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: t.available < 10 ? "var(--err-600)" : "var(--ok-700)", fontFamily: "var(--font-mono)" }}>{t.available}</span>
                          <span className="muted" style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}>/ {t.total}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", paddingLeft: 12, borderLeft: "1px solid var(--ink-150)" }}>
                        <div className="muted" style={{ fontSize: 11, marginBottom: 2 }}>Desde</div>
                        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", fontFamily: "var(--font-mono)" }}>
                          Bs <span style={{ color: "var(--accent-600)" }}>{t.price}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seat plan */}
          <div className="card" style={{ padding: 22 }}>
            <div className="h-stack" style={{ justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>Selección de asientos</h3>
                <p className="muted" style={{ margin: "2px 0 0", fontSize: 12.5 }}>
                  {selectedTrip.bus} · Primer piso
                </p>
              </div>
              <SeatLegend />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "start" }}>
              {/* Bus diagram */}
              <div style={{
                background: "var(--ink-050)",
                border: "1px solid var(--ink-200)",
                borderRadius: 16,
                padding: "20px 16px",
                position: "relative",
              }}>
                {/* Driver section */}
                <div className="h-stack" style={{ justifyContent: "space-between", marginBottom: 18, padding: "0 4px" }}>
                  <div style={{ width: 40, height: 28, borderRadius: 6, background: "var(--ink-200)", display: "grid", placeItems: "center", color: "var(--ink-600)" }}>
                    <I.Steering size={16} />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-500)" }}>FRENTE</div>
                  <div style={{ width: 40, height: 28, borderRadius: 6, background: "var(--ink-200)", display: "grid", placeItems: "center", color: "var(--ink-600)" }}>
                    <I.Driver size={14} />
                  </div>
                </div>

                {/* Seats */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {seats.map((row, ri) => (
                    <div key={ri} className="h-stack" style={{ gap: 4, justifyContent: "center" }}>
                      <Seat s={row[0]} onClick={toggleSeat} />
                      <Seat s={row[1]} onClick={toggleSeat} />
                      <div style={{ width: 22, color: "var(--ink-300)", textAlign: "center", fontSize: 10, fontWeight: 700, paddingTop: 12 }}>
                        {ri + 1}
                      </div>
                      <Seat s={row[2]} onClick={toggleSeat} />
                      <Seat s={row[3]} onClick={toggleSeat} />
                    </div>
                  ))}
                </div>

                {/* Back */}
                <div style={{ marginTop: 14, padding: "6px 0", textAlign: "center", borderTop: "2px dashed var(--ink-300)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-500)" }}>
                  POSTERIOR · WC
                </div>
              </div>

              {/* Selected seats summary */}
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>ASIENTOS SELECCIONADOS</div>
                {selectedSeats.length === 0 ? (
                  <div style={{
                    border: "1.5px dashed var(--ink-200)",
                    borderRadius: 10, padding: 24, textAlign: "center",
                    color: "var(--ink-500)", fontSize: 13,
                  }}>
                    Haz clic en los asientos disponibles<br/>(verde) para reservarlos.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selectedSeats.map(s => (
                      <div key={s} className="h-stack" style={{ justifyContent: "space-between", padding: "10px 12px", background: "var(--accent-100)", borderRadius: 8, border: "1px solid var(--accent-400)" }}>
                        <div className="h-stack" style={{ gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--accent-500)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, fontFamily: "var(--font-mono)" }}>{s}</div>
                          <div style={{ lineHeight: 1.2 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Asiento {s}</div>
                            <div className="muted" style={{ fontSize: 11 }}>{["A","D"].includes(s.slice(-1)) ? "Ventana" : "Pasillo"}</div>
                          </div>
                        </div>
                        <div className="h-stack" style={{ gap: 8 }}>
                          <span className="mono" style={{ fontWeight: 700 }}>Bs {selectedTrip.price}</span>
                          <button onClick={() => toggleSeat({ id: s, status: "selected" })} className="btn btn-icon btn-ghost" style={{ height: 24, width: 24 }}>
                            <I.Close size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 16, padding: 14, background: "var(--ink-050)", borderRadius: 10, border: "1px solid var(--ink-200)" }}>
                  <div className="h-stack" style={{ justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }}>
                    <span className="muted">Subtotal ({selectedSeats.length} × Bs {selectedTrip.price})</span>
                    <span className="mono" style={{ fontWeight: 600 }}>Bs {total}</span>
                  </div>
                  <div className="h-stack" style={{ justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }}>
                    <span className="muted">Tasa terminal</span>
                    <span className="mono" style={{ fontWeight: 600 }}>Bs {selectedSeats.length * 3}</span>
                  </div>
                  <div className="h-stack" style={{ justifyContent: "space-between", paddingTop: 10, borderTop: "1px dashed var(--ink-300)" }}>
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span className="mono" style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.01em" }}>Bs {total + selectedSeats.length * 3}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right col: Passenger details */}
        <div className="card" style={{ padding: 20, position: "sticky", top: 20 }}>
          <div className="h-stack" style={{ marginBottom: 4, gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--brand-050)", color: "var(--brand-700)", display: "grid", placeItems: "center" }}>
              <I.Driver size={15} />
            </div>
            <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>Datos del pasajero</h3>
          </div>
          <p className="muted" style={{ margin: "0 0 18px", fontSize: 12 }}>
            Información requerida para emitir el boleto.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label className="field-label">Nombre</label>
                <input className="input" placeholder="Ana María" />
              </div>
              <div>
                <label className="field-label">Apellidos</label>
                <input className="input" placeholder="Quispe Mamani" />
              </div>
            </div>
            <div>
              <label className="field-label">Carnet de Identidad (CI)</label>
              <div className="h-stack" style={{ gap: 8 }}>
                <input className="input" placeholder="8765432" style={{ flex: 1 }} />
                <select className="input" defaultValue="LP" style={{ width: 80 }}>
                  <option>LP</option><option>CB</option><option>SC</option><option>OR</option><option>PT</option><option>SU</option><option>TJ</option><option>BE</option><option>PA</option>
                </select>
              </div>
            </div>
            <div>
              <label className="field-label">Celular</label>
              <input className="input" placeholder="+591 7xxx xxxx" />
            </div>
            <div>
              <label className="field-label">Correo (opcional)</label>
              <input className="input" placeholder="boleto digital se enviará aquí" />
            </div>

            <div style={{ marginTop: 4 }}>
              <label className="field-label">Método de pago</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { id: "cash", label: "Efectivo", icon: "Money", active: true },
                  { id: "qr", label: "QR Bancario", icon: "Pricing" },
                  { id: "card", label: "Tarjeta POS", icon: "Ticket" },
                  { id: "transfer", label: "Transferencia", icon: "ArrowRight" },
                ].map(p => {
                  const Ico = I[p.icon];
                  return (
                    <button key={p.id} className="h-stack" style={{
                      padding: "10px 12px", gap: 8,
                      border: `1.5px solid ${p.active ? "var(--brand-700)" : "var(--ink-200)"}`,
                      background: p.active ? "var(--brand-050)" : "var(--white)",
                      borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                      color: p.active ? "var(--brand-800)" : "var(--ink-700)",
                    }}>
                      <Ico size={15} />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button className="btn btn-accent" style={{
            width: "100%", justifyContent: "center", height: 44, marginTop: 18,
            fontSize: 14,
            opacity: selectedSeats.length === 0 ? 0.5 : 1,
          }}>
            Emitir boleto · Bs {total + selectedSeats.length * 3}
            <I.ArrowRight size={16} />
          </button>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", height: 36, marginTop: 6, fontSize: 12.5, color: "var(--ink-500)" }}>
            Guardar como borrador
          </button>
        </div>
      </div>
    </div>
  );
};

window.Tickets = Tickets;
