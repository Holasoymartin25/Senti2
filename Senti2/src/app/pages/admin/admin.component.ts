import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Subscription } from 'rxjs';
import { AuthApiService } from '../../core/services/auth-api.service';
import { MessageService } from '../../core/services/message.service';
import { environment } from '../../../environments/environment';
import { RouterModule } from '@angular/router';

interface AdminUser {
    id: number;
    name: string | null;
    email: string;
    role: string;
    created_at: string;
    unread_count?: number;
}

interface UserForm {
    name: string;
    email: string;
    password: string;
    role: string;
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

interface Solicitud {
    id: number;
    user: { id: number; name: string | null; email: string } | null;
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
}

interface Cita {
    id: number;
    paciente: { id: number; name: string | null; email: string } | null;
    fecha_hora: string;
    duracion: number;
    modalidad: 'presencial' | 'online';
    estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
    notas: string;
    created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
    user: 'Usuario',
    psicologo: 'Psicólogo',
    admin: 'Admin',
};

const ALL_ROLES = ['user', 'psicologo', 'admin'];

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
};

const ESTADO_CITA_LABELS: Record<string, string> = {
    pendiente:   'Pendiente',
    confirmada:  'Confirmada',
    cancelada:   'Cancelada',
    completada:  'Completada',
};

const MODALIDAD_LABELS: Record<string, string> = {
    presencial: 'Presencial',
    online:     'Online',
};

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
    // Vista admin
    users: AdminUser[] = [];
    loading = true;
    errorMsg = '';
    successMsg = '';
    currentUserRole = '';
    private messageSubscription!: Subscription;
    readonly roleLabels = ROLE_LABELS;
    readonly allRoles = ALL_ROLES;
    readonly statusLabels = STATUS_LABELS;

    // CRUD usuarios
    mostrarFormUsuario = false;
    editandoUsuario: AdminUser | null = null;
    guardandoUsuario = false;
    nuevoUsuario: UserForm = { name: '', email: '', password: '', role: 'user' };
    confirmandoEliminar: number | null = null;

    // Vista psicólogo
    psiTab: 'sin-asignar' | 'mis-pacientes' | 'solicitudes-enviadas' | 'citas' = 'sin-asignar';
    sinAsignar: AdminUser[] = [];
    misPacientes: AdminUser[] = [];
    solicitudesEnviadas: Solicitud[] = [];
    loadingPsi = false;
    selectedPatient: PatientData | null = null;
    loadingPatient = false;

    // Solicitud inline
    solicitudAbiertaId: number | null = null;
    solicitudMensaje = '';
    enviandoSolicitud = false;

    // Citas
    citas: Cita[] = [];
    loadingCitas = false;
    mostrarFormCita = false;
    editandoCita: Cita | null = null;
    guardandoCita = false;
    filtroPacienteCita = '';
    nuevaCita = {
        paciente_id: '',
        fecha_hora: '',
        duracion: 60,
        modalidad: 'presencial' as 'presencial' | 'online',
        notas: '',
    };
    readonly estadoCitaLabels = ESTADO_CITA_LABELS;
    readonly modalidadLabels = MODALIDAD_LABELS;
    readonly estadosCita = ['pendiente', 'confirmada', 'cancelada', 'completada'];

    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private authApi: AuthApiService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.currentUserRole = this.authApi.getCurrentUserValue()?.role ?? '';
        if (this.currentUserRole === 'admin') {
            this.loadUsers();
        } else if (this.currentUserRole === 'psicologo') {
            this.loadPsiData();
        }

        // Suscribirse a mensajes entrantes en tiempo real para actualizar badges de pacientes
        this.messageSubscription = this.messageService.messageReceived$.subscribe((msg) => {
            if (this.currentUserRole === 'psicologo') {
                const paciente = this.misPacientes.find(p => p.id === msg.sender_id);
                if (paciente) {
                    paciente.unread_count = (paciente.unread_count || 0) + 1;
                }
            }
        });
    }

    ngOnDestroy(): void {
        if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
        }
    }

    private getHeaders(): HttpHeaders {
        const token = this.authApi.getToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        });
    }

    // ADMIN

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

    abrirFormNuevoUsuario(): void {
        this.editandoUsuario = null;
        this.nuevoUsuario = { name: '', email: '', password: '', role: 'user' };
        this.mostrarFormUsuario = true;
        this.confirmandoEliminar = null;
    }

    abrirFormEditarUsuario(user: AdminUser): void {
        this.editandoUsuario = user;
        this.nuevoUsuario = { name: user.name ?? '', email: user.email, password: '', role: user.role };
        this.mostrarFormUsuario = true;
        this.confirmandoEliminar = null;
    }

    cerrarFormUsuario(): void {
        this.mostrarFormUsuario = false;
        this.editandoUsuario = null;
    }

    async guardarUsuario(): Promise<void> {
        if (!this.nuevoUsuario.email) return;
        this.errorMsg = '';
        this.successMsg = '';
        this.guardandoUsuario = true;
        try {
            if (this.editandoUsuario) {
                const payload: any = {
                    name:  this.nuevoUsuario.name || null,
                    email: this.nuevoUsuario.email,
                    role:  this.nuevoUsuario.role,
                };
                if (this.nuevoUsuario.password) payload.password = this.nuevoUsuario.password;
                const res: any = await firstValueFrom(
                    this.http.put(`${this.apiUrl}/admin/users/${this.editandoUsuario.id}`, payload, { headers: this.getHeaders() })
                );
                const idx = this.users.findIndex(u => u.id === this.editandoUsuario!.id);
                if (idx !== -1) this.users[idx] = res.user;
                this.successMsg = `Usuario ${res.user.email} actualizado`;
            } else {
                if (!this.nuevoUsuario.password) return;
                const res: any = await firstValueFrom(
                    this.http.post(`${this.apiUrl}/admin/users`, {
                        name:     this.nuevoUsuario.name || null,
                        email:    this.nuevoUsuario.email,
                        password: this.nuevoUsuario.password,
                        role:     this.nuevoUsuario.role,
                    }, { headers: this.getHeaders() })
                );
                this.users.push(res.user);
                this.successMsg = `Usuario ${res.user.email} creado correctamente`;
            }
            this.cerrarFormUsuario();
        } catch (error: any) {
            this.errorMsg = error.error?.error
                ? JSON.stringify(error.error.error)
                : 'Error al guardar el usuario';
        } finally {
            this.guardandoUsuario = false;
        }
    }

    pedirConfirmacionEliminar(id: number): void {
        this.confirmandoEliminar = id;
    }

    cancelarEliminar(): void {
        this.confirmandoEliminar = null;
    }

    async eliminarUsuario(user: AdminUser): Promise<void> {
        this.errorMsg = '';
        this.successMsg = '';
        try {
            await firstValueFrom(
                this.http.delete(`${this.apiUrl}/admin/users/${user.id}`, { headers: this.getHeaders() })
            );
            this.users = this.users.filter(u => u.id !== user.id);
            this.successMsg = `Usuario ${user.email} eliminado`;
            this.confirmandoEliminar = null;
        } catch (error: any) {
            this.errorMsg = error.error?.error || 'Error al eliminar el usuario';
        }
    }

    // ── PSICÓLOGO ──────────────────────────────────────────

    async loadPsiData(): Promise<void> {
        this.loadingPsi = true;
        this.errorMsg = '';
        try {
            const [sinRes, pacRes, solRes, citasRes]: any[] = await Promise.all([
                firstValueFrom(this.http.get(`${this.apiUrl}/psicologo/sin-asignar`, { headers: this.getHeaders() })),
                firstValueFrom(this.http.get(`${this.apiUrl}/psicologo/pacientes`, { headers: this.getHeaders() })),
                firstValueFrom(this.http.get(`${this.apiUrl}/psicologo/solicitudes-enviadas`, { headers: this.getHeaders() })),
                firstValueFrom(this.http.get(`${this.apiUrl}/psicologo/citas`, { headers: this.getHeaders() })),
            ]);
            this.sinAsignar = sinRes.users ?? [];
            this.misPacientes = pacRes.pacientes ?? [];
            this.solicitudesEnviadas = solRes.solicitudes ?? [];
            this.citas = citasRes.citas ?? [];
        } catch (error: any) {
            this.errorMsg = error.error?.error || 'Error al cargar datos';
        } finally {
            this.loadingPsi = false;
        }
    }

    abrirFormSolicitud(userId: number): void {
        this.solicitudAbiertaId = userId;
        this.solicitudMensaje = '';
    }

    cerrarFormSolicitud(): void {
        this.solicitudAbiertaId = null;
        this.solicitudMensaje = '';
    }

    async enviarSolicitud(user: AdminUser): Promise<void> {
        if (!this.solicitudMensaje.trim()) return;
        this.errorMsg = '';
        this.successMsg = '';
        this.enviandoSolicitud = true;
        try {
            const res: any = await firstValueFrom(
                this.http.post(
                    `${this.apiUrl}/psicologo/pacientes/${user.id}/solicitar`,
                    { message: this.solicitudMensaje },
                    { headers: this.getHeaders() }
                )
            );
            this.sinAsignar = this.sinAsignar.filter(u => u.id !== user.id);
            this.solicitudesEnviadas.unshift(res.solicitud);
            this.successMsg = `Solicitud enviada a ${user.email}`;
            this.cerrarFormSolicitud();
        } catch (error: any) {
            this.errorMsg = error.error?.error || 'Error al enviar la solicitud';
        } finally {
            this.enviandoSolicitud = false;
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

    get solicitudesPendientesCount(): number {
        return this.solicitudesEnviadas.filter(s => s.status === 'pending').length;
    }

    get totalPacientesUnreadMessages(): number {
        return this.misPacientes.reduce((sum, p) => sum + (p.unread_count || 0), 0);
    }

    // CITAS
    async loadCitas(): Promise<void> {
        this.loadingCitas = true;
        this.errorMsg = '';
        try {
            const res: any = await firstValueFrom(
                this.http.get(`${this.apiUrl}/psicologo/citas`, { headers: this.getHeaders() })
            );
            this.citas = res.citas ?? [];
        } catch (error: any) {
            this.errorMsg = error.error?.error || 'Error al cargar las citas';
        } finally {
            this.loadingCitas = false;
        }
    }

    abrirFormNuevaCita(): void {
        this.editandoCita = null;
        this.nuevaCita = { paciente_id: '', fecha_hora: '', duracion: 60, modalidad: 'presencial', notas: '' };
        this.mostrarFormCita = true;
    }

    abrirFormEditarCita(cita: Cita): void {
        this.editandoCita = cita;
        this.nuevaCita = {
            paciente_id: String(cita.paciente?.id ?? ''),
            fecha_hora: cita.fecha_hora,
            duracion: cita.duracion,
            modalidad: cita.modalidad,
            notas: cita.notas,
        };
        this.mostrarFormCita = true;
    }

    cerrarFormCita(): void {
        this.mostrarFormCita = false;
        this.editandoCita = null;
    }

    async guardarCita(): Promise<void> {
        if (!this.nuevaCita.paciente_id || !this.nuevaCita.fecha_hora) return;
        this.errorMsg = '';
        this.successMsg = '';
        this.guardandoCita = true;
        try {
            if (this.editandoCita) {
                const res: any = await firstValueFrom(
                    this.http.patch(
                        `${this.apiUrl}/psicologo/citas/${this.editandoCita.id}`,
                        { ...this.nuevaCita, paciente_id: undefined },
                        { headers: this.getHeaders() }
                    )
                );
                const idx = this.citas.findIndex(c => c.id === this.editandoCita!.id);
                if (idx !== -1) this.citas[idx] = res.cita;
                this.successMsg = 'Cita actualizada';
            } else {
                const res: any = await firstValueFrom(
                    this.http.post(
                        `${this.apiUrl}/psicologo/citas`,
                        { ...this.nuevaCita, paciente_id: Number(this.nuevaCita.paciente_id) },
                        { headers: this.getHeaders() }
                    )
                );
                this.citas.unshift(res.cita);
                this.successMsg = 'Cita creada correctamente';
            }
            this.cerrarFormCita();
        } catch (error: any) {
            if (error.status === 422 || error.status === 409) {
                this.errorMsg = error.error?.error || 'Ya existe una cita programada en esa franja horaria';
            } else {
                this.errorMsg = error.error?.error || 'Error al guardar la cita';
            }
        } finally {
            this.guardandoCita = false;
        }
    }

    async cambiarEstadoCita(cita: Cita, nuevoEstado: string): Promise<void> {
        this.errorMsg = '';
        try {
            const res: any = await firstValueFrom(
                this.http.patch(
                    `${this.apiUrl}/psicologo/citas/${cita.id}`,
                    { estado: nuevoEstado },
                    { headers: this.getHeaders() }
                )
            );
            const idx = this.citas.findIndex(c => c.id === cita.id);
            if (idx !== -1) this.citas[idx] = res.cita;
        } catch (error: any) {
            this.errorMsg = error.error?.error || 'Error al actualizar el estado';
        }
    }

    async eliminarCita(cita: Cita): Promise<void> {
        this.errorMsg = '';
        try {
            await firstValueFrom(
                this.http.delete(`${this.apiUrl}/psicologo/citas/${cita.id}`, { headers: this.getHeaders() })
            );
            this.citas = this.citas.filter(c => c.id !== cita.id);
            this.successMsg = 'Cita eliminada';
        } catch (error: any) {
            this.errorMsg = error.error?.error || 'Error al eliminar la cita';
        }
    }

    get citasFiltradas(): Cita[] {
        const filtro = this.filtroPacienteCita.toLowerCase();
        if (!filtro) return this.citas;
        return this.citas.filter(c =>
            c.paciente?.name?.toLowerCase().includes(filtro) ||
            c.paciente?.email?.toLowerCase().includes(filtro)
        );
    }
}
