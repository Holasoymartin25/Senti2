import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { environment } from '../../../environments/environment';

export interface AdminStats {
  summary: {
    totalUsersWithData: number;
    totalTestResults: number;
    totalDiaryEntries: number;
    averageMood: number | null;
  };
  testsByTitle: Record<string, number>;
  moodSeries: { date: string; avg: number; count: number }[];
  roleCounts: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class AdminStatsService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authApi: AuthApiService
  ) {}

  private headers(): HttpHeaders {
    const token = this.authApi.getToken();
    let h = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      h = h.set('Authorization', `Bearer ${token}`);
    }
    return h;
  }

  async getStats(): Promise<AdminStats> {
    const res = await firstValueFrom(
      this.http.get<AdminStats>(`${this.apiUrl}/admin/stats`, {
        headers: this.headers(),
      })
    );
    return res;
  }
}
