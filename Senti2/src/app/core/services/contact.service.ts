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

    async sendContactForm(data: ContactFormData): Promise<{ message?: string; error?: string }> {
        const formData = new FormData();
        formData.append('nombre', data.nombre ?? '');
        formData.append('apellidos', data.apellidos ?? '');
        formData.append('email', data.email ?? '');
        formData.append('mensaje', data.mensaje ?? '');
        if (data.cv) {
            formData.append('cv', data.cv, data.cv.name);
        }

        try {
            const response: any = await this.http.post(`${this.apiUrl}/contact`, formData).toPromise();
            return { message: response?.message };
        } catch (err: any) {
            return { error: err?.error?.error ?? err?.error?.message ?? 'Error' };
        }
    }
}
