import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authApi: AuthApiService
  ) {}

  ngOnInit(): void {
    this.loadSolicitudesCount();
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
}
