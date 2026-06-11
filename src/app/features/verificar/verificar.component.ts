import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { MatIconModule } from '@angular/material/icon';
import { VERIFICAR_FACTURA } from '../../graphql/publico.graphql';

interface VerificacionResult {
  existe: boolean;
  autentica: boolean;
  numeroFactura?: string;
  monto?: number;
  txHash?: string;
  blockNumber?: number;
  fechaRegistro?: string;
  urlExplorador?: string;
}

@Component({
  selector: 'app-verificar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './verificar.component.html',
  styleUrl: './verificar.component.scss',
})
export class VerificarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apollo = inject(Apollo);

  hashInput = '';
  readonly loading = signal(false);
  readonly resultado = signal<VerificacionResult | null>(null);
  readonly errorMsg = signal<string | null>(null);
  readonly consultado = signal(false);
  readonly currentYear = new Date().getFullYear();

  ngOnInit(): void {
    const hashParam = this.route.snapshot.queryParamMap.get('hash');
    if (hashParam) {
      this.hashInput = hashParam;
      this.verificar();
    }
  }

  verificar(): void {
    const h = this.hashInput.trim();
    if (!h) return;
    this.loading.set(true);
    this.resultado.set(null);
    this.errorMsg.set(null);
    this.consultado.set(false);

    this.apollo.query<any>({
      query: VERIFICAR_FACTURA,
      variables: { hash: h },
      fetchPolicy: 'network-only',
    }).subscribe({
      next: (r) => {
        this.loading.set(false);
        this.consultado.set(true);
        this.resultado.set(r.data?.verificarFactura ?? null);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.consultado.set(true);
        this.errorMsg.set(err.message || 'Error al verificar la factura.');
      },
    });
  }

  formatFecha(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-BO', { dateStyle: 'long', timeStyle: 'short' });
  }

  formatMonto(monto?: number): string {
    if (monto == null) return '—';
    return 'Bs ' + monto.toFixed(2);
  }
}
