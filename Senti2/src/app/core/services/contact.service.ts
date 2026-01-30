import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ContactFormData {
    nombre: string;
    apellidos: string;
    email: string;
    mensaje: string;
    cv?: File | null;
}

@Injectable({
    providedIn: 'root'
})
export class ContactService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    async sendContactForm(data: ContactFormData): Promise<{ success: true; message: string } | { success: false; error: string }> {
        const formData = new FormData();
        formData.append('nombre', data.nombre || '');
        formData.append('apellidos', data.apellidos || '');
        formData.append('email', data.email || '');
        formData.append('mensaje', data.mensaje || '');
        if (data.cv) {
            formData.append('cv', data.cv, data.cv.name);
        }

        try {
            const response: any = await this.http.post(`${this.apiUrl}/contact`, formData).toPromise();
            return { success: true, message: response?.message ?? 'Mensaje enviado correctamente.' };
        } catch (error: any) {
            // Laravel devuelve errores de validación con código 422
            if (error?.status === 422 && error?.error?.errors) {
                // Obtener el primer mensaje de error de validación
                const firstError = Object.values(error.error.errors)[0];
                const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                return { success: false, error: errorMessage };
            }
            
            // Otros errores (500, etc.)
            const errorMessage = error?.error?.error ?? error?.error?.message ?? 'No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.';
            return { success: false, error: errorMessage };
        }
    }
}
