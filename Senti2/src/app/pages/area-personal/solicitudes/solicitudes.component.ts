import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { environment } from '../../../../environments/environment';

interface SolicitudRecibida {
    id: number;
    message: string;
    psicologo: {
        id: number;
        name: string | null;
        email: string;
    };
    created_at: string;
}

@Component({
    selector: 'app-solicitudes',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './solicitudes.component.html',
    styleUrls: ['./solicitudes.component.css']
})
export class SolicitudesComponent implements OnInit {
    solicitudes: SolicitudRecibida[] = [];
    loading = true;
    errorMsg = '';
    successMsg = '';
    procesandoId: number | null = null;

    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private authApi: AuthApiService
    ) {}

    ngOnInit(): void {
        this.loadSolicitudes();
    }

    private getHeaders(): HttpHeaders {
        const token = this.authApi.getToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        });
    }

    async loadSolicitudes(): Promise<void> {
        this.loading = true;
        this.errorMsg = '';
        try {
            const res: any = await firstValueFrom(
                this.http.get(`${this.apiUrl}/solicitudes`, { headers: this.getHeaders() })
            );
            this.solicitudes = res.solicitudes ?? [];
        } catch (error: any) {
            this.errorMsg = error.error?.error || 'Error al cargar las solicitudes';
        } finally {
            this.loading = false;
        }
    }

    async aceptar(solicitud: SolicitudRecibida): Promise<void> {
        this.errorMsg = '';
        this.successMsg = '';
        this.procesandoId = solicitud.id;
        try {
            await firstValueFrom(
                this.http.post(`${this.apiUrl}/solicitudes/${solicitud.id}/aceptar`, {}, { headers: this.getHeaders() })
            );
            this.solicitudes = [];
            this.successMsg = `Has aceptado a ${solicitud.psicologo.name ?? solicitud.psicologo.email} como tu psicólogo.`;
        } catch (error: any) {
            this.errorMsg = error.error?.error || 'Error al aceptar la solicitud';
        } finally {
            this.procesandoId = null;
        }
    }

    async rechazar(solicitud: SolicitudRecibida): Promise<void> {
        this.errorMsg = '';
        this.successMsg = '';
        this.procesandoId = solicitud.id;
        try {
            await firstValueFrom(
                this.http.post(`${this.apiUrl}/solicitudes/${solicitud.id}/rechazar`, {}, { headers: this.getHeaders() })
            );
            this.solicitudes = this.solicitudes.filter(s => s.id !== solicitud.id);
            this.successMsg = `Solicitud de ${solicitud.psicologo.name ?? solicitud.psicologo.email} rechazada.`;
        } catch (error: any) {
            this.errorMsg = error.error?.error || 'Error al rechazar la solicitud';
        } finally {
            this.procesandoId = null;
        }
    }
}
