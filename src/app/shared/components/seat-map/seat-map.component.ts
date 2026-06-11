import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AsientoSeatMap {
  id: string;
  numeroAsiento: string | number;
  estado: string;
}

@Component({
  selector: 'app-seat-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bus-diagram">
      <div class="bus-front">
        <div class="steering">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="12" r="2.5"/>
          </svg>
        </div>
        <span class="front-label">FRENTE</span>
        <div class="co-driver">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="12" cy="8" r="3.5"/>
            <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/>
          </svg>
        </div>
      </div>

      <div class="seat-grid">
        @for (fila of filas(); track fila; let i = $index) {
          <div class="seat-row">
            @for (asiento of fila.izquierda; track asiento.id) {
              <button
                class="seat"
                [class]="'seat-' + asiento.estado"
                [class.seat-selected]="isSelected(asiento.id)"
                [disabled]="asiento.estado === 'OCUPADO'"
                (click)="onSeatClick(asiento)"
              >
                {{ asiento.numeroAsiento }}
              </button>
            }
            <span class="aisle-row-num">{{ i + 1 }}</span>
            @for (asiento of fila.derecha; track asiento.id) {
              <button
                class="seat"
                [class]="'seat-' + asiento.estado"
                [class.seat-selected]="isSelected(asiento.id)"
                [disabled]="asiento.estado === 'OCUPADO'"
                (click)="onSeatClick(asiento)"
              >
                {{ asiento.numeroAsiento }}
              </button>
            }
          </div>
        }
      </div>

      <div class="bus-back">
        <span class="back-label">POSTERIOR · WC</span>
      </div>
    </div>

    <div class="seat-legend">
      <div class="legend-item">
        <span class="legend-box libre"></span> Disponible
      </div>
      <div class="legend-item">
        <span class="legend-box selected"></span> Seleccionado
      </div>
      <div class="legend-item">
        <span class="legend-box ocupado"></span> Ocupado
      </div>
    </div>
  `,
  styles: `
    .bus-diagram {
      background: var(--ink-050);
      border: 1px solid var(--color-border);
      border-radius: var(--r-xl);
      padding: 20px 16px;
    }

    .bus-front {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
      padding: 0 4px;
    }

    .steering, .co-driver {
      width: 36px;
      height: 26px;
      border-radius: 6px;
      background: var(--ink-200);
      display: grid;
      place-items: center;
      color: var(--ink-600);
    }

    .front-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--color-text-secondary);
    }

    .seat-grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .seat-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .seat {
      width: 42px;
      height: 42px;
      border-radius: 8px 8px 4px 4px;
      font-size: 11.5px;
      font-weight: 700;
      font-family: var(--font-mono);
      border: 1.5px solid;
      cursor: pointer;
      position: relative;
      transition: transform 100ms;
    }

    .seat:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .seat:disabled {
      cursor: not-allowed !important;
    }

    .seat-LIBRE {
      background: var(--ok-050);
      border-color: var(--ok-600);
      color: var(--ok-700);
      box-shadow: inset 0 -2px 0 rgba(0,0,0,0.06);
    }

    .seat-OCUPADO {
      background: var(--err-100);
      border-color: var(--err-600);
      color: var(--err-700);
    }

    .seat-RESERVADO {
      background: var(--warn-100);
      border-color: var(--warn-500);
      color: var(--warn-700);
    }

    .seat-selected, .seat-SELECCIONADO {
      background: var(--color-accent) !important;
      border-color: var(--accent-700) !important;
      color: var(--white) !important;
      box-shadow: 0 4px 12px rgba(var(--accent-500-rgb), 0.35) !important;
    }

    .aisle-row-num {
      width: 22px;
      text-align: center;
      font-size: 10px;
      font-weight: 700;
      color: var(--ink-300);
      padding-top: 12px;
    }

    .bus-back {
      margin-top: 14px;
      padding: 6px 0;
      text-align: center;
      border-top: 2px dashed var(--ink-300);
    }

    .back-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--color-text-secondary);
    }

    .seat-legend {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 12px;
      font-size: 11.5px;
      color: var(--ink-600);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-box {
      width: 14px;
      height: 14px;
      border-radius: 4px;
      border: 1.5px solid;

      &.libre {
        background: var(--ok-050);
        border-color: var(--ok-600);
      }
      &.selected {
        background: var(--color-accent);
        border-color: var(--accent-700);
      }
      &.ocupado {
        background: var(--err-100);
        border-color: var(--err-600);
      }
    }
  `,
})
export class SeatMapComponent {
  readonly asientos = input<AsientoSeatMap[]>([]);
  readonly numCarriles = input(4);

  readonly selectedIds = input<string[]>([]);
  readonly seatSelected = output<AsientoSeatMap>();

  readonly filas = computed(() => {
    const carrilesPorLado = this.numCarriles() / 2;
    const seats = [...this.asientos()];
    const filas: { izquierda: AsientoSeatMap[]; derecha: AsientoSeatMap[] }[] = [];
    while (seats.length > 0) {
      filas.push({
        izquierda: seats.splice(0, carrilesPorLado),
        derecha: seats.splice(0, carrilesPorLado),
      });
    }
    return filas;
  });

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  onSeatClick(asiento: AsientoSeatMap): void {
    if (asiento.estado === 'LIBRE' || asiento.estado === 'SELECCIONADO') {
      this.seatSelected.emit(asiento);
    }
  }
}
