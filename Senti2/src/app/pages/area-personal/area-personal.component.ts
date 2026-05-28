import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../core/services/auth-api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-area-personal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './area-personal.component.html',
  styleUrls: ['./area-personal.component.css']
})
export class AreaPersonalComponent implements OnInit {
  solicitudesPendientes = 0;
  psicologoId: number | null = null;
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authApi: AuthApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSolicitudesCount();
    this.loadMiPsicologo();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authApi.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  private async loadSolicitudesCount(): Promise<void> {
    try {
      const res: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/solicitudes`, { headers: this.getHeaders() })
      );
      this.solicitudesPendientes = (res.solicitudes ?? []).length;
    } catch {
      // No bloquear si falla, el badge simplemente no muestra número
    }
  }

  private async loadMiPsicologo(): Promise<void> {
    try {
      const res: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/mi-psicologo`, { headers: this.getHeaders() })
      );
      this.psicologoId = res.psicologo?.id ?? null;
    } catch {
      this.psicologoId = null;
    }
  }

  irAlChat(): void {
    if (this.psicologoId) {
      this.router.navigate(['/chat', this.psicologoId]);
    }
  }
}