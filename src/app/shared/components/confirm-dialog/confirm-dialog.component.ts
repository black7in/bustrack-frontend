import { Component, inject, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>{{ title() }}</h2>
    <mat-dialog-content>
      <p class="confirm-message">{{ message() }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ cancelLabel() }}</button>
      <button mat-flat-button [color]="confirmColor()" (click)="onConfirm()">
        {{ confirmLabel() }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .confirm-message { margin: 0; font-size: 14px; color: var(--color-text-secondary); line-height: 1.5; }
  `,
})
export class ConfirmDialogComponent {
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  private dialogData = inject(MAT_DIALOG_DATA, { optional: true });

  readonly title = computed(() => this.dialogData?.title || 'Confirmar accion');
  readonly message = computed(() => this.dialogData?.message || '¿Estas seguro?');
  readonly confirmLabel = computed(() => this.dialogData?.confirmLabel || 'Confirmar');
  readonly cancelLabel = computed(() => this.dialogData?.cancelLabel || 'Cancelar');
  readonly confirmColor = computed(() => this.dialogData?.confirmColor || 'primary');

  onConfirm(): void { this.dialogRef.close(true); }
  onCancel(): void { this.dialogRef.close(false); }
}
