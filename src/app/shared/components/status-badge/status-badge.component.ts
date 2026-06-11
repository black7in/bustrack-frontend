import { Component, input } from '@angular/core';

export type BadgeVariant = 'ok' | 'warn' | 'err' | 'info' | 'neutral';

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  ok: 'badge-ok',
  warn: 'badge-warn',
  err: 'badge-err',
  info: 'badge-info',
  neutral: 'badge-neutral',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="badge" [class]="variantClass">
      <span class="dot"></span>
      {{ label() }}
    </span>
  `,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 22px;
      padding: 0 8px;
      border-radius: var(--r-pill);
      font-size: 11.5px;
      font-weight: 600;
      letter-spacing: -0.005em;
      white-space: nowrap;
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .badge-ok {
      background: var(--ok-050);
      color: var(--ok-700);
      .dot { background: var(--ok-600); }
    }
    .badge-warn {
      background: var(--warn-050);
      color: var(--warn-700);
      .dot { background: var(--warn-500); }
    }
    .badge-err {
      background: var(--err-050);
      color: var(--err-700);
      .dot { background: var(--err-600); }
    }
    .badge-info {
      background: var(--brand-050);
      color: var(--brand-700);
      .dot { background: var(--brand-600); }
    }
    .badge-neutral {
      background: var(--ink-100);
      color: var(--ink-700);
      .dot { background: var(--ink-500); }
    }
  `,
})
export class StatusBadgeComponent {
  readonly label = input('Programado');
  readonly variant = input<BadgeVariant>('neutral');

  get variantClass(): string {
    return VARIANT_CLASS[this.variant()] ?? 'badge-neutral';
  }
}
