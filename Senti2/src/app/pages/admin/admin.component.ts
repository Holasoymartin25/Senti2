import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../core/services/auth-api.service';
import { environment } from '../../../environments/environment';

interface AdminUser {
    id: number;
    name: string | null;
    email: string;
    role: string;
    created_at: string;
}

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
    users: AdminUser[] = [];
    loading = true;
    errorMsg = '';
    successMsg = '';
    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private authApi: AuthApiService
    ) {}

    ngOnInit(): void {
        this.loadUsers();
    }

    private getHeaders(): HttpHeaders {
        const token = this.authApi.getToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        });
    }

    async loadUsers(): Promise<void> {
        this.loading = true;
        this.errorMsg = '';
        try {
            const response: any = await firstValueFrom(
                this.http.get(`${this.apiUrl}/admin/users`, { headers: this.getHeaders() })
            );
            this.users = response.users ?? [];
        } catch (error: any) {
            this.errorMsg = error.error?.error || 'Error al cargar los usuarios';
        } finally {
            this.loading = false;
        }
    }

    async toggleRole(user: AdminUser): Promise<void> {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        this.errorMsg = '';
        this.successMsg = '';
        try {
            await firstValueFrom(
                this.http.patch(
                    `${this.apiUrl}/admin/users/${user.id}/role`,
                    { role: newRole },
                    { headers: this.getHeaders() }
                )
            );
            user.role = newRole;
            this.successMsg = `Rol de ${user.email} actualizado a "${newRole}"`;
        } catch (error: any) {
            this.errorMsg = error.error?.error || 'Error al cambiar el rol';
        }
    }
}
