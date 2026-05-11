import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

interface DiaryEntry {
    id: number;
    date: string;
    mood: number;
    emotions: string[];
    note: string;
}

interface TestResult {
    testTitle: string;
    displayScore: number;
    displayMax: number;
    level: string;
    date: string;
}

interface PatientData {
    user: { id: number; name: string | null; email: string };
    diary: DiaryEntry[];
    tests: TestResult[];
}

const ROLE_LABELS: Record<string, string> = {
    user: 'Usuario',
    psicologo: 'Psicólogo',
    admin: 'Admin',
};

const ALL_ROLES = ['user', 'psicologo', 'admin'];

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
    // Vista admin
    users: AdminUser[] = [];
    loading = true;
    errorMsg = '';
    successMsg = '';
    currentUserRole = '';
    readonly roleLabels = ROLE_LABELS;
    readonly allRoles = ALL_ROLES;

    // Vista psicólogo
    psiTab: 'sin-asignar' | 'mis-pacientes' = 'sin-asignar';
    sinAsignar: AdminUser[] = [];
    misPacientes: AdminUser[] = [];
    loadingPsi = false;
    selectedPatient: PatientData | null = null;
    loadingPatient = false;

    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private authApi: AuthApiService
    ) {}

    ngOnInit(): void {
        this.currentUserRole = this.authApi.getCurrentUserValue()?.role ?? '';
        if (this.currentUserRole === 'admin') {
            this.loadUsers();
        } else if (this.currentUserRole === 'psicologo') {
            this.loadPsiData();
        }
    }

    private getHeaders(): HttpHeaders {
        const token = this.authApi.getToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        });
    }

    // ── ADMIN ──────────────────────────────────────────────

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

    async changeRole(user: AdminUser, newRole: string): Promise<void> {
        if (newRole === user.role) return;
        this.errorMsg = '';
        this.successMsg = '';
        const previousRole = user.role;
        user.role = newRole;
        try {
            await firstValueFrom(
                this.http.patch(
                    `${this.apiUrl}/admin/users/${user.id}/role`,
                    { role: newRole },
                    { headers: this.getHeaders() }
                )
            );
            this.successMsg = `Rol de ${user.email} actualizado a "${ROLE_LABELS[newRole]}"`;
        } catch (error: any) {
            user.role = previousRole;
            this.errorMsg = error.error?.error || 'Error al cambiar el rol';
        }
    }

    // ── PSICÓLOGO ──────────────────────────────────────────

    async loadPsiData(): Promise<void> {
        this.loadingPsi = true;
        this.errorMsg = '';
        try {
            const [sinRes, pacRes]: any[] = await Promise.all([
                firstValueFrom(this.http.get(`${this.apiUrl}/psicologo/sin-asignar`, { headers: this.getHeaders() })),
                firstValueFrom(this.http.get(`${this.apiUrl}/psicologo/pacientes`, { headers: this.getHeaders() })),
            ]);
            this.sinAsignar = sinRes.users ?? [];
            this.misPacientes = pacRes.pacientes ?? [];
        } catch (error: any) {
            this.errorMsg = error.error?.error || 'Error al cargar datos';
        } finally {
            this.loadingPsi = false;
        }
    }

    async asignarPaciente(user: AdminUser): Promise<void> {
        this.errorMsg = '';
        this.successMsg = '';
        try {
            await firstValueFrom(
                this.http.post(`${this.apiUrl}/psicologo/pacientes/${user.id}/asignar`, {}, { headers: this.getHeaders() })
            );
            this.sinAsignar = this.sinAsignar.filter(u => u.id !== user.id);
            this.misPacientes.push(user);
            this.successMsg = `${user.email} añadido como paciente`;
            this.psiTab = 'mis-pacientes';
        } catch (error: any) {
            this.errorMsg = error.error?.error || 'Error al asignar paciente';
        }
    }

    async desasignarPaciente(user: AdminUser): Promise<void> {
        this.errorMsg = '';
        this.successMsg = '';
        if (this.selectedPatient?.user.id === user.id) this.selectedPatient = null;
        try {
            await firstValueFrom(
                this.http.delete(`${this.apiUrl}/psicologo/pacientes/${user.id}/desasignar`, { headers: this.getHeaders() })
            );
            this.misPacientes = this.misPacientes.filter(u => u.id !== user.id);
            this.sinAsignar.push(user);
            this.successMsg = `${user.email} desvinculado`;
        } catch (error: any) {
            this.errorMsg = error.error?.error || 'Error al desvincular paciente';
        }
    }

    async verDatosPaciente(user: AdminUser): Promise<void> {
        if (this.selectedPatient?.user.id === user.id) {
            this.selectedPatient = null;
            return;
        }
        this.loadingPatient = true;
        this.selectedPatient = null;
        try {
            const data: any = await firstValueFrom(
                this.http.get(`${this.apiUrl}/psicologo/pacientes/${user.id}/datos`, { headers: this.getHeaders() })
            );
            this.selectedPatient = data;
        } catch (error: any) {
            this.errorMsg = error.error?.error || 'Error al cargar datos del paciente';
        } finally {
            this.loadingPatient = false;
        }
    }

    closePatient(): void {
        this.selectedPatient = null;
    }
}
