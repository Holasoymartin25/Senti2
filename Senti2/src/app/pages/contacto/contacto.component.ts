import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent {
  nombre = '';
  apellidos = '';
  email = '';
  mensaje = '';
  cv: File | null = null;

  sending = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private contactService: ContactService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.cv = input.files[0];
    } else {
      this.cv = null;
    }
  }

  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    const nombre = this.nombre?.trim();
    const apellidos = this.apellidos?.trim();
    const email = this.email?.trim();
    const mensaje = this.mensaje?.trim();

    if (!nombre || !apellidos || !email || !mensaje) {
      this.errorMessage = 'Por favor, completa todos los campos obligatorios.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.errorMessage = 'Introduce un email válido.';
      return;
    }

    this.sending = true;

    this.contactService.send({
      nombre,
      apellidos,
      email,
      mensaje,
      cv: this.cv ?? undefined
    }).subscribe({
      next: (res) => {
        this.sending = false;
        this.successMessage = res.message ?? 'Mensaje enviado correctamente.';
        this.nombre = '';
        this.apellidos = '';
        this.email = '';
        this.mensaje = '';
        this.cv = null;
        const fileInput = document.querySelector('#cv-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (err) => {
        this.sending = false;
        const msg = err.error?.message;
        const errors = err.error?.errors;
        if (errors && typeof errors === 'object') {
          const first = Object.values(errors).flat()[0];
          this.errorMessage = (first as string) || msg || 'Error al enviar. Inténtalo de nuevo.';
        } else {
          this.errorMessage = msg || 'Error al enviar. Inténtalo de nuevo.';
        }
      }
    });
  }
}
