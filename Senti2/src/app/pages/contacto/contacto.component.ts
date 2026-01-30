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
    loading = false;
    successMessage = '';
    errorMessage = '';

    constructor(private contactService: ContactService) {}

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files?.length) {
            this.cv = input.files[0];
        } else {
            this.cv = null;
        }
    }

    async onSubmit(): Promise<void> {
        this.successMessage = '';
        this.errorMessage = '';
        this.loading = true;

        const result = await this.contactService.sendContactForm({
            nombre: this.nombre,
            apellidos: this.apellidos,
            email: this.email,
            mensaje: this.mensaje,
            cv: this.cv ?? undefined
        });

        this.loading = false;

        if (result.success) {
            this.successMessage = result.message;
            this.nombre = '';
            this.apellidos = '';
            this.email = '';
            this.mensaje = '';
            this.cv = null;
            const fileInput = document.querySelector('#cv-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } else {
            this.errorMessage = result.error;
        }
    }
}
