/* BusTrack BO — Modal + placeholder screens */

const Modal = ({ open, onClose, title, subtitle, children, footer, width = 560 }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(11, 26, 43, 0.45)",
      backdropFilter: "blur(2px)",
      display: "grid", placeItems: "center",
      animation: "fadeIn 160ms ease",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width, maxWidth: "calc(100vw - 40px)", maxHeight: "calc(100vh - 60px)",
        background: "var(--white)", borderRadius: 14,
        boxShadow: "var(--shadow-xl)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        animation: "modalIn 200ms ease",
      }}>
        <div className="h-stack" style={{ justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--ink-150)" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--ink-900)" }}>{title}</h3>
            {subtitle && <p className="muted" style={{ margin: "2px 0 0", fontSize: 12.5 }}>{subtitle}</p>}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><I.Close size={16} /></button>
        </div>
        <div style={{ padding: 24, overflow: "auto", flex: 1 }}>{children}</div>
        {footer && (
          <div className="h-stack" style={{ justifyContent: "flex-end", gap: 8, padding: "14px 24px", borderTop: "1px solid var(--ink-150)", background: "var(--ink-050)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const RegisterBusModal = ({ open, onClose }) => (
  <Modal
    open={open} onClose={onClose}
    title="Registrar nuevo bus"
    subtitle="Agrega un vehículo a la flota de BusTrack BO"
    width={620}
    footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
      <button className="btn btn-primary" onClick={onClose}>Guardar bus</button>
    </>}
  >
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        border: "1.5px dashed var(--ink-300)",
        borderRadius: 10, padding: 24,
        background: "var(--ink-050)",
        textAlign: "center",
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--white)", border: "1px solid var(--ink-200)", margin: "0 auto 10px", display: "grid", placeItems: "center" }}>
          <I.Bus size={20} style={{ color: "var(--brand-700)" }} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Sube fotografías del bus</div>
        <div className="muted" style={{ fontSize: 12 }}>Frontal, lateral e interior · JPG/PNG hasta 5MB</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label className="field-label">Placa</label>
          <input className="input" placeholder="BTB-XXX" />
        </div>
        <div>
          <label className="field-label">Año</label>
          <input className="input" placeholder="2024" />
        </div>
        <div>
          <label className="field-label">Marca</label>
          <select className="input" defaultValue="Mercedes-Benz">
            <option>Mercedes-Benz</option><option>Volvo</option><option>Scania</option><option>Iveco</option>
          </select>
        </div>
        <div>
          <label className="field-label">Modelo</label>
          <input className="input" placeholder="O500RSD 2442" />
        </div>
        <div>
          <label className="field-label">Tipo de servicio</label>
          <select className="input" defaultValue="Cama Ejecutivo">
            <option>Semi Cama</option><option>Cama Ejecutivo</option><option>Cama Suite</option>
          </select>
        </div>
        <div>
          <label className="field-label">Capacidad</label>
          <input className="input" placeholder="44" />
        </div>
      </div>

      <div>
        <label className="field-label">Notas internas</label>
        <textarea className="input" rows={3} style={{ padding: 12, height: "auto", resize: "vertical" }} placeholder="Observaciones, mantenimientos previos, etc."></textarea>
      </div>
    </div>
  </Modal>
);

const RegisterDriverModal = ({ open, onClose }) => (
  <Modal
    open={open} onClose={onClose}
    title="Registrar nuevo chofer"
    subtitle="Crea el perfil de un conductor profesional"
    width={560}
    footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
      <button className="btn btn-primary" onClick={onClose}>Guardar chofer</button>
    </>}
  >
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="h-stack" style={{ gap: 14, padding: "12px 14px", background: "var(--ink-050)", borderRadius: 10, border: "1px solid var(--ink-200)" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--white)", border: "1.5px dashed var(--ink-300)", display: "grid", placeItems: "center" }}>
          <I.Driver size={24} style={{ color: "var(--ink-400)" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Foto del chofer</div>
          <div className="muted" style={{ fontSize: 11.5, marginBottom: 6 }}>Cuadrada, mínimo 400×400px</div>
          <button className="btn btn-outline btn-sm">Subir foto</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label className="field-label">Nombres</label>
          <input className="input" placeholder="Edwin" />
        </div>
        <div>
          <label className="field-label">Apellidos</label>
          <input className="input" placeholder="Mamani Condori" />
        </div>
        <div>
          <label className="field-label">CI</label>
          <input className="input" placeholder="5478921" />
        </div>
        <div>
          <label className="field-label">Expedido</label>
          <select className="input" defaultValue="LP">
            <option>LP</option><option>CB</option><option>SC</option><option>OR</option><option>PT</option><option>SU</option><option>TJ</option><option>BE</option><option>PA</option>
          </select>
        </div>
        <div>
          <label className="field-label">Licencia categoría</label>
          <select className="input" defaultValue="C-PROF">
            <option>C-PROF</option><option>P-PROF</option><option>T-PROF</option>
          </select>
        </div>
        <div>
          <label className="field-label">Vencimiento</label>
          <input className="input" placeholder="2028-03-12" />
        </div>
        <div>
          <label className="field-label">Celular</label>
          <input className="input" placeholder="+591 7xxx xxxx" />
        </div>
        <div>
          <label className="field-label">Años de experiencia</label>
          <input className="input" placeholder="12" />
        </div>
      </div>
    </div>
  </Modal>
);

/* ===== Other minimal screens ===== */

const PlaceholderScreen = ({ icon, title, lines }) => {
  const Ico = I[icon];
  return (
    <div style={{ padding: 28 }}>
      <div className="card" style={{ padding: 56, textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: "0 auto 18px",
          background: "var(--brand-050)", color: "var(--brand-700)",
          display: "grid", placeItems: "center",
        }}>
          <Ico size={28} stroke={1.5} />
        </div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h2>
        <p className="muted" style={{ margin: "8px auto 20px", maxWidth: 480, fontSize: 13.5, lineHeight: 1.5 }}>
          Esta sección sigue el mismo patrón visual de Flota y Choferes: tabla con búsqueda, filtros, paginación y modal de creación.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, maxWidth: 640, margin: "0 auto" }}>
          {lines.map(l => (
            <div key={l} style={{ padding: "12px 14px", background: "var(--ink-050)", borderRadius: 8, fontSize: 12.5, fontWeight: 500, color: "var(--ink-700)", border: "1px solid var(--ink-200)" }}>
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Trips = () => <PlaceholderScreen icon="Route" title="Gestión de Viajes"
  lines={["Calendario semanal", "Programar viaje", "Reasignar bus/chofer", "Cancelar/Reprogramar", "Boletos vendidos", "Bitácora de eventos"]} />;

const Routes = () => <PlaceholderScreen icon="MapPin" title="Rutas Interdepartamentales"
  lines={["Mapa de Bolivia", "Paradas intermedias", "Distancia & duración", "Restricciones de carretera", "Tarifa base por ruta", "Estacionalidad"]} />;

const Pricing = () => <PlaceholderScreen icon="Pricing" title="Tarifas"
  lines={["Tarifa por ruta", "Tipo de servicio", "Descuentos (3ra edad, est.)", "Recargos feriado", "Promociones", "Historial de cambios"]} />;

const Reports = () => <PlaceholderScreen icon="Reports" title="Reportes"
  lines={["Ventas por periodo", "Ocupación por ruta", "Rendimiento chofer", "Mantenimiento flota", "Caja diaria", "Exportar PDF/Excel"]} />;

window.Modal = Modal;
window.RegisterBusModal = RegisterBusModal;
window.RegisterDriverModal = RegisterDriverModal;
window.Trips = Trips;
window.Routes = Routes;
window.Pricing = Pricing;
window.Reports = Reports;
