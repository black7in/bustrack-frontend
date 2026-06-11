import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="stat-card card">
      <div class="stat-top">
        <div class="stat-icon-box">
          <mat-icon class="stat-icon">{{ icon() }}</mat-icon>
        </div>
        <span class="stat-badge badge" [class]="'badge-' + (trendUp() ? 'ok' : 'err')">
          <mat-icon class="badge-arrow">{{ trendUp() ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
          {{ trendPrefix() }}{{ trend() }}%
        </span>
      </div>
      <div class="stat-label-text">{{ label() }}</div>
      <div class="stat-value-row">
        <span class="stat-value mono">{{ value() }}</span>
        @if (unit()) {
          <span class="stat-unit">{{ unit() }}</span>
        }
      </div>
      <div class="stat-compare">{{ trendLabel() }}</div>
    </div>
  `,
  styles: `
    .card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--r-lg);
      box-shadow: var(--shadow-sm);
    }
    .stat-card {
      padding: 18px;
    }
    .stat-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .stat-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--brand-050);
      color: var(--color-primary);
      display: grid;
      place-items: center;
    }
    .stat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .stat-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      height: 22px;
      padding: 0 8px;
      border-radius: var(--r-pill);
      font-size: 11.5px;
      font-weight: 600;
    }
    .badge-arrow {
      font-size: 11px;
      width: 11px;
      height: 11px;
    }
    .badge-ok {
      background: var(--ok-050);
      color: var(--ok-700);
    }
    .badge-err {
      background: var(--err-050);
      color: var(--err-700);
    }
    .stat-label-text {
      font-size: 12.5px;
      color: var(--color-text-secondary);
      font-weight: 500;
      margin-bottom: 4px;
    }
    .stat-value-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .stat-value {
      font-size: 26px;
      font-weight: 800;
      color: var(--ink-900);
      letter-spacing: -0.02em;
      font-family: var(--font-mono);
    }
    .stat-unit {
      font-size: 12px;
      color: var(--color-text-secondary);
    }
    .stat-compare {
      font-size: 11px;
      color: var(--ink-400);
      margin-top: 6px;
    }
    .mono {
      font-family: var(--font-mono);
      font-feature-settings: 'tnum' 1;
    }
  `,
})
export class StatCardComponent {
  readonly label = input('Boletos vendidos hoy');
  readonly value = input('342');
  readonly unit = input('');
  readonly icon = input('confirmation_number');
  readonly trend = input(8.2);
  readonly trendLabel = input('vs ayer');

  readonly trendUp = () => this.trend() >= 0;
  readonly trendPrefix = () => (this.trend() >= 0 ? '+' : '');
}
