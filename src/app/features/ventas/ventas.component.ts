import { Component, inject, signal, computed, effect, OnInit, OnDestroy } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CurrencyBobPipe } from '../../shared/pipes/currency-bob.pipe';
import { AuthService } from '../../core/auth/auth.service';
import { AsientoSeatMap } from '../../shared/components/seat-map/seat-map.component';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import {
  RUTAS_ACTIVAS, VIAJES_DISPONIBLES, TARIFA_ACTUAL, VIAJE_POR_ID,
  CLIENTE_POR_CI, CREAR_CLIENTE, VENDER_BOLETO, BOLETO_POR_ID,
} from '../../graphql/ventas.graphql';

interface RutaItem { id: string; origen: { nombre: string }; destino: { nombre: string } }
interface TerminalItem { id: string; nombre: string }
interface ViajeDisponible { id: string; fecha: string; horario: { horaSalida: string; ruta?: { origen?: { nombre: string }; destino?: { nombre: string } } }; bus: { placa: string; numeroCarriles: number }; choferTitular: { nombre: string }; asientos: AsientoSeatMap[]; totalVendidos: number; totalLibres: number }
interface ClienteEncontrado { id: string; ci: string; nombre: string; telefono?: string; email?: string }

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatIconModule, MatSnackBarModule,
    CurrencyBobPipe,
  ],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss',
})
export class VentasComponent implements OnInit, OnDestroy {
  private apollo = inject(Apollo);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private ciSub?: Subscription;

  readonly rutas = signal<RutaItem[]>([]);
  readonly viajesDisponibles = signal<ViajeDisponible[]>([]);
  readonly viajeSeleccionado = signal<ViajeDisponible | null>(null);
  readonly selectedSeats = signal<AsientoSeatMap[]>([]);
  readonly precioAsiento = signal(0);
  readonly clienteEncontrado = signal<ClienteEncontrado | null>(null);
  readonly clienteStatus = signal<'idle' | 'searching' | 'found' | 'new'>('idle');
  readonly loading = signal(false);
  readonly vendiendo = signal(false);
  readonly boletoEmitido = signal<any>(null);

  readonly origenId = signal('');
  readonly destinoId = signal('');
  readonly fechaVal = signal(new Date());

  readonly showOrigen = computed(() => this.auth.usuario()?.rol === 'ADMIN');

  readonly origenes = computed(() => {
    const set = new Map<string, TerminalItem>();
    for (const r of this.rutas()) {
      if (!set.has(r.origen.nombre)) set.set(r.origen.nombre, { id: r.origen.nombre, nombre: r.origen.nombre });
    }
    return Array.from(set.values());
  });

  readonly destinos = computed(() => {
    const orig = this.origenId();
    const set = new Map<string, TerminalItem>();
    for (const r of this.rutas()) {
      if (!orig || r.origen.nombre === orig) {
        if (!set.has(r.destino.nombre)) set.set(r.destino.nombre, { id: r.destino.nombre, nombre: r.destino.nombre });
      }
    }
    return Array.from(set.values());
  });

  readonly fechaStr = computed(() => {
    const d = this.fechaVal();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  });

  setFechaStr(val: string): void { if (val) this.fechaVal.set(new Date(val + 'T00:00:00')); }

  readonly searchForm = this.fb.group({
    rutaId: ['', Validators.required],
    fecha: [new Date(), Validators.required],
  });

  readonly passengerForm = this.fb.group({
    nombre: ['', Validators.required],
    apellidos: [''],
    ci: ['', Validators.required],
    expedido: ['LP'],
    celular: ['+591'],
    correo: [''],
    nit: [''],
    razonSocial: [''],
    precioVenta: [null as number | null],
  });

  readonly pagos = signal([
    { id: 'efectivo', label: 'Efectivo', icon: 'attach_money', active: true },
    { id: 'qr', label: 'QR Bancario', icon: 'qr_code', active: false },
    { id: 'pos', label: 'Tarjeta POS', icon: 'credit_card', active: false },
    { id: 'transferencia', label: 'Transferencia', icon: 'arrow_forward', active: false },
  ]);

  readonly asientosFilas = computed(() => {
    const seats = [...(this.viajeSeleccionado()?.asientos || [])].sort(
      (a, b) => parseInt(String(a.numeroAsiento)) - parseInt(String(b.numeroAsiento))
    );
    const superiores = seats.slice(0, 36);
    const inferiores = seats.slice(36);
    const armarFilas = (lista: AsientoSeatMap[]) => {
      const filas: { izquierda: AsientoSeatMap[]; derecha: AsientoSeatMap[] }[] = [];
      const copy = [...lista];
      while (copy.length > 0) filas.push({ derecha: copy.splice(0, 1), izquierda: copy.splice(0, 2) });
      return filas.reverse();
    };
    return { superior: armarFilas(superiores), inferior: inferiores.length > 0 ? armarFilas(inferiores) : null };
  });

  readonly precioEfectivo = signal(0);

  readonly subtotal = computed(() => this.selectedSeats().length * this.precioEfectivo());
  readonly tasaTerminal = computed(() => this.selectedSeats().length * 3);
  get totalBs(): number { return this.subtotal() + this.tasaTerminal(); }

  constructor() {
    this.loadRutas();
    this.setupCiSearch();
    this.setupPrecioWatcher();
  }

  private setupPrecioWatcher(): void {
    const updatePrecio = () => {
      const pv = this.passengerForm.get('precioVenta')?.value;
      this.precioEfectivo.set(pv != null && Number(pv) > 0 ? Number(pv) : this.precioAsiento());
    };
    this.passengerForm.get('precioVenta')?.valueChanges.subscribe(() => updatePrecio());
    // Also update when tarifa changes
    effect(() => { this.precioAsiento(); updatePrecio(); });
  }
  ngOnInit(): void {}
  ngOnDestroy(): void { this.ciSub?.unsubscribe(); }

  private loadRutas(): void {
    this.apollo.query<any>({ query: RUTAS_ACTIVAS, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { if (r.data?.rutas) this.rutas.set(r.data.rutas); },
    });
  }

  private setupCiSearch(): void {
    const ciControl = this.passengerForm.get('ci');
    if (!ciControl) return;
    this.ciSub = ciControl.valueChanges.pipe(
      debounceTime(500), distinctUntilChanged(), filter((val): val is string => !!val && val.length >= 3),
      switchMap((ci) => {
        this.clienteStatus.set('searching');
        return this.apollo.query<any>({ query: CLIENTE_POR_CI, variables: { ci }, fetchPolicy: 'network-only' });
      })
    ).subscribe({
      next: (r) => {
        if (r.data?.clientePorCi) {
          const c = r.data.clientePorCi;
          this.clienteEncontrado.set(c);
          this.clienteStatus.set('found');
          this.passengerForm.patchValue({ nombre: c.nombre, celular: c.telefono || '', correo: c.email || '' }, { emitEvent: false });
        } else { this.clienteEncontrado.set(null); this.clienteStatus.set('new'); }
      },
      error: () => { this.clienteEncontrado.set(null); this.clienteStatus.set('new'); },
    });
  }

  onOrigenChange(): void { this.destinoId.set(''); }

  buscarViajes(): void {
    const orig = this.origenId(); const dest = this.destinoId();
    if (!dest) return;
    let ruta = this.rutas().find((r) => r.origen.nombre === orig && r.destino.nombre === dest);
    if (!ruta && !orig) ruta = this.rutas().find((r) => r.destino.nombre === dest);
    if (!ruta) return;
    this.loading.set(true); this.viajeSeleccionado.set(null); this.selectedSeats.set([]); this.precioAsiento.set(0);

    if (ruta.id) {
      this.apollo.query<any>({ query: TARIFA_ACTUAL, variables: { rutaId: ruta.id, fecha: this.fechaStr() }, fetchPolicy: 'network-only' }).subscribe({
        next: (tr) => { if (tr.data?.tarifaActual?.precioBase) this.precioAsiento.set(tr.data.tarifaActual.precioBase); },
      });
    }

    this.apollo.query<any>({ query: VIAJES_DISPONIBLES, variables: { rutaId: ruta.id, fecha: this.fechaStr() }, fetchPolicy: 'network-only' }).subscribe({
      next: (r) => { this.loading.set(false); if (r.data?.viajesDisponibles) this.viajesDisponibles.set(r.data.viajesDisponibles); },
      error: () => this.loading.set(false),
    });
  }

  seleccionarViaje(v: ViajeDisponible): void {
    this.viajeSeleccionado.set(v);
    this.selectedSeats.set([]);
    if (!v.asientos?.length) {
      this.apollo.query<any>({
        query: VIAJE_POR_ID,
        variables: { id: v.id },
        fetchPolicy: 'network-only',
      }).subscribe({
        next: (r) => {
          if (r.data?.viaje) {
            this.viajeSeleccionado.update((prev) => ({ ...prev!, asientos: r.data.viaje.asientos || [] }));
          }
        },
      });
    }
  }

  toggleAsiento(asiento: AsientoSeatMap): void {
    const estado = String(asiento.estado).toUpperCase();
    if (estado === 'OCUPADO' || estado === 'OCCUPIED' || estado === 'VENDIDO') return;
    const current = this.selectedSeats();
    const idx = current.findIndex((s) => s.id === asiento.id);
    if (idx >= 0) { this.selectedSeats.update((s) => s.filter((a) => a.id !== asiento.id)); }
    else { if (current.length >= 4) return; this.selectedSeats.update((s) => [...s, asiento]); }
  }

  seatClass(a: AsientoSeatMap): string {
    const sel = this.selectedSeats().some((s) => s.id === a.id);
    if (sel) return 's-libre sel';
    const estado = String(a.estado).toUpperCase();
    if (estado === 'OCUPADO' || estado === 'OCCUPIED' || estado === 'VENDIDO') return 's-ocupado';
    return 's-libre';
  }

  isSeatSelected(id: string): boolean { return this.selectedSeats().some((s) => s.id === id); }

  isWindowSeat(numero: string | number): boolean {
    const str = String(numero);
    const last = str.slice(-1).toUpperCase();
    return ['A', 'D'].includes(last);
  }

  setPago(id: string): void { this.pagos.update((items) => items.map((p) => ({ ...p, active: p.id === id }))); }

  venderBoleto(): void {
    if (this.selectedSeats().length === 0 || !this.viajeSeleccionado()) return;
    if (this.passengerForm.invalid) { this.passengerForm.markAllAsTouched(); return; }
    this.vendiendo.set(true);
    const { nombre, apellidos, ci, celular, correo, nit, razonSocial, precioVenta } = this.passengerForm.value;
    const nombreCompleto = [nombre, apellidos].filter(Boolean).join(' ');

    const procesar = (clienteId: string) => {
      const asiento = this.selectedSeats()[0];
      const input: any = { viajeId: this.viajeSeleccionado()!.id, asientoId: asiento.id, clienteId, nit: nit || null, razonSocial: nit ? (razonSocial || null) : null };
      if (precioVenta != null) input.precioVenta = Number(precioVenta);
      this.apollo.mutate<any>({
        mutation: VENDER_BOLETO,
        variables: { input },
      }).subscribe({
        next: (r) => {
          const boletoId = r.data?.venderBoleto?.id;
          if (boletoId) {
            this.apollo.query<any>({ query: BOLETO_POR_ID, variables: { id: boletoId }, fetchPolicy: 'network-only' }).subscribe({
              next: (br) => {
                this.vendiendo.set(false);
                this.boletoEmitido.set(br.data?.boleto ?? r.data?.venderBoleto);
                this.snackBar.open('Boleto emitido con exito', 'Cerrar', { duration: 5000 });
              },
              error: () => {
                this.vendiendo.set(false);
                this.boletoEmitido.set(r.data?.venderBoleto);
                this.snackBar.open('Boleto emitido con exito', 'Cerrar', { duration: 5000 });
              },
            });
          } else {
            this.vendiendo.set(false); this.boletoEmitido.set(r.data?.venderBoleto);
            this.snackBar.open('Boleto emitido con exito', 'Cerrar', { duration: 5000 });
          }
        },
        error: (err: any) => { this.vendiendo.set(false); this.snackBar.open(err.message || 'Error', 'Cerrar', { duration: 5000 }); },
      });
    };

    if (this.clienteEncontrado()) { procesar(this.clienteEncontrado()!.id); }
    else {
      this.apollo.mutate<any>({
        mutation: CREAR_CLIENTE,
        variables: { input: { ci: ci!, nombre: nombreCompleto, telefono: celular || null, email: correo || null } },
      }).subscribe({
        next: (r) => {
          const nuevoId = r.data?.crearCliente?.id;
          if (nuevoId) procesar(nuevoId);
          else { this.vendiendo.set(false); this.snackBar.open('Error al crear cliente', 'Cerrar', { duration: 5000 }); }
        },
        error: (err: any) => { this.vendiendo.set(false); this.snackBar.open(err.message || 'Error', 'Cerrar', { duration: 5000 }); },
      });
    }
  }

  nuevoBoleto(): void {
    const viajeId = this.viajeSeleccionado()?.id;
    this.boletoEmitido.set(null);
    this.selectedSeats.set([]);
    this.clienteEncontrado.set(null);
    this.clienteStatus.set('idle');
    this.passengerForm.reset({ expedido: 'LP' });
    // Refrescar asientos del viaje
    if (viajeId) {
      this.apollo.query<any>({
        query: VIAJE_POR_ID,
        variables: { id: viajeId },
        fetchPolicy: 'network-only',
      }).subscribe({
        next: (r) => {
          if (r.data?.viaje) {
            this.viajeSeleccionado.update((prev) => prev ? { ...prev, asientos: r.data.viaje.asientos || [], totalVendidos: r.data.viaje.totalVendidos, totalLibres: r.data.viaje.totalLibres } : prev);
          }
        },
      });
    }
  }

  descargarPDF(): void {
    const url = this.boletoEmitido()?.pdfUrl;
    if (url) window.open(url, '_blank');
  }

  descargarFactura(): void {
    const url = this.boletoEmitido()?.factura?.pdfUrl;
    if (url) window.open(url, '_blank');
  }
}
