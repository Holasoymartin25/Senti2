import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactForm {
  nombre: string;
  apellidos: string;
  email: string;
  mensaje: string;
  cv?: File | null;
}

export interface ContactResponse {
  message: string;
}

export interface ContactErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  send(form: ContactForm): Observable<ContactResponse> {
    const formData = new FormData();
    formData.append('nombre', form.nombre.trim());
    formData.append('apellidos', form.apellidos.trim());
    formData.append('email', form.email.trim());
    formData.append('mensaje', form.mensaje.trim());
    if (form.cv) {
      formData.append('cv', form.cv, form.cv.name);
    }

    return this.http.post<ContactResponse>(`${this.apiUrl}/contact`, formData);
  }
}
