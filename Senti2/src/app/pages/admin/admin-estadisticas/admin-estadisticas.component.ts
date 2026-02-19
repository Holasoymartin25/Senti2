import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminStatsService, AdminStats } from '../../../core/services/admin-stats.service';

@Component({
  selector: 'app-admin-estadisticas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-estadisticas.component.html',
  styleUrls: ['./admin-estadisticas.component.css'],
})
export class AdminEstadisticasComponent implements OnInit {
  stats: AdminStats | null = null;
  loading = true;
  error: string | null = null;

  constructor(private adminStats: AdminStatsService) {}

  ngOnInit(): void {
    void this.loadStats();
  }

  async loadStats(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      this.stats = await this.adminStats.getStats();
    } catch (e) {
      this.error = 'No se pudieron cargar las estadísticas. Verifica tus permisos.';
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  getTestsByTitleEntries(): { title: string; count: number }[] {
    if (!this.stats?.testsByTitle) return [];
    return Object.entries(this.stats.testsByTitle).map(([title, count]) => ({ title, count }));
  }

  getMaxTestCount(): number {
    const entries = this.getTestsByTitleEntries();
    if (entries.length === 0) return 1;
    return Math.max(...entries.map((e) => e.count), 1);
  }

  getRoleCounts(): { key: string; value: number }[] {
    if (!this.stats?.roleCounts) return [];
    return Object.entries(this.stats.roleCounts).map(([key, value]) => ({ key, value }));
  }
}
