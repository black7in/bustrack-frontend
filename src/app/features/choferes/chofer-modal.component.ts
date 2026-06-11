import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import { CREAR_CHOFER, GENERAR_URL_SUBIDA, GUARDAR_FOTO_CHOFER } from '../../graphql/flota.graphql';

@Component({
  selector: 'app-chofer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './chofer-modal.component.html',
  styleUrl: './chofer-modal.component.scss',
})
export class ChoferModalComponent {
  private fb = inject(FormBuilder);
  private apollo = inject(Apollo);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<ChoferModalComponent>);

  readonly saving = signal(false);
  readonly crearCuenta = signal(false);
  readonly fotoFile = signal<File | null>(null);
  readonly fotoPreview = signal('');
  readonly fotoFacialFile = signal<File | null>(null);
  readonly fotoFacialPreview = signal('');

  readonly form = this.fb.group({
    nombre: ['', Validators.required],
    ci: ['', Validators.required],
    telefono: [''],
    licenciaNumero: ['', Validators.required],
    licenciaCategoria: ['C-PROF', Validators.required],
    licenciaVence: ['', Validators.required],
    emailUsuario: [''],
    passwordUsuario: [''],
  });

  toggleAccount(): void { this.crearCuenta.update((v) => !v); }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.fotoFile.set(file);
      const reader = new FileReader();
      reader.onload = () => this.fotoPreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onFacialFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.fotoFacialFile.set(file);
      const reader = new FileReader();
      reader.onload = () => this.fotoFacialPreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  close(result?: any): void { this.dialogRef.close(result); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.value;
    const input: any = {
      nombre: val.nombre, ci: val.ci, telefono: val.telefono,
      licenciaCategoria: val.licenciaCategoria, licenciaNumero: val.licenciaNumero, licenciaVence: val.licenciaVence,
    };
    if (this.crearCuenta() && val.emailUsuario && val.passwordUsuario) {
      input.crearUsuario = true;
      input.emailUsuario = val.emailUsuario;
      input.passwordUsuario = val.passwordUsuario;
    }

    this.apollo.mutate<any>({ mutation: CREAR_CHOFER, variables: { input } }).subscribe({
      next: (r) => {
        const newId = r.data?.crearChofer?.id;
        if (newId && (this.fotoFile() || this.fotoFacialFile())) {
          this.subirFotos(newId);
        } else {
          this.saving.set(false);
          this.snackBar.open('Chofer registrado', 'Cerrar', { duration: 3000 });
          this.close(true);
        }
      },
      error: (err) => { this.saving.set(false); this.snackBar.open(err.message || 'Error', 'Cerrar', { duration: 3000 }); },
    });
  }

  private subirFotos(choferId: string): void {
    const tareas: Array<{ file: File; tipo: string }> = [];
    if (this.fotoFile()) tareas.push({ file: this.fotoFile()!, tipo: 'FOTO_CHOFER' });
    if (this.fotoFacialFile()) tareas.push({ file: this.fotoFacialFile()!, tipo: 'FOTO_FACIAL' });
    this.subirSiguiente(choferId, tareas, 0);
  }

  private subirSiguiente(choferId: string, tareas: Array<{ file: File; tipo: string }>, idx: number): void {
    if (idx >= tareas.length) {
      this.saving.set(false);
      this.snackBar.open('Chofer registrado con foto', 'Cerrar', { duration: 3000 });
      this.close(true);
      return;
    }

    const { file, tipo } = tareas[idx];
    const ext = file.name.split('.').pop() || null;

    this.apollo.mutate<any>({ mutation: GENERAR_URL_SUBIDA, variables: { tipo, entidadId: choferId, extension: ext } }).subscribe({
      next: (r) => {
        const data = r.data?.generarUrlSubida;
        const uploadUrl: string = typeof data === 'string' ? data : data?.uploadUrl;
        const s3Key: string = data?.s3Key;

        if (!uploadUrl) {
          this.subirSiguiente(choferId, tareas, idx + 1);
          return;
        }

        this.http.put(uploadUrl, file, { headers: new HttpHeaders({ 'Content-Type': file.type }) }).subscribe({
          next: () => {
            if (s3Key) {
              this.apollo.mutate<any>({ mutation: GUARDAR_FOTO_CHOFER, variables: { id: choferId, s3Key, tipo } }).subscribe({
                next: () => this.subirSiguiente(choferId, tareas, idx + 1),
                error: () => this.subirSiguiente(choferId, tareas, idx + 1),
              });
            } else {
              this.subirSiguiente(choferId, tareas, idx + 1);
            }
          },
          error: () => this.subirSiguiente(choferId, tareas, idx + 1),
        });
      },
      error: () => this.subirSiguiente(choferId, tareas, idx + 1),
    });
  }
}
