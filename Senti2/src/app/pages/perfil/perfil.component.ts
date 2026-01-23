import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import { Router } from '@angular/router';

interface UserProfile {
  id?: string;
  user_id: string;
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  profile: UserProfile = {
    user_id: '',
    nombre: '',
    apellidos: '',
    telefono: '',
    fecha_nacimiento: ''
  };
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  userEmail = '';
  editMode = false;
  displayName = '';
  userMetadata: any = {};

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.loading = true;
    try {
      const user = await this.supabase.getCurrentUser();
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.userEmail = user.email || '';
      this.profile.user_id = user.id;
      this.userMetadata = user.user_metadata || {};
      this.displayName = await this.supabase.getUserDisplayName(user.id);

      const existingProfile = await this.supabase.getUserProfile(user.id);
      if (existingProfile) {
        this.profile = existingProfile;
        if (this.profile.fecha_nacimiento) {
          const date = new Date(this.profile.fecha_nacimiento);
          this.profile.fecha_nacimiento = date.toISOString().split('T')[0];
        }
      } else {
        this.profile.user_id = user.id;
      }
    } catch (error: any) {
      this.errorMessage = 'Error al cargar el perfil: ' + (error.message || 'Error desconocido');
    } finally {
      this.loading = false;
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  async saveProfile() {
    if (!this.profile.user_id) {
      this.errorMessage = 'No se pudo identificar al usuario';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const updatedProfile = await this.supabase.updateUserProfile(this.profile);
      if (updatedProfile) {
        this.profile = updatedProfile;
        if (this.profile.fecha_nacimiento) {
          const date = new Date(this.profile.fecha_nacimiento);
          this.profile.fecha_nacimiento = date.toISOString().split('T')[0];
        }
        this.successMessage = 'Perfil actualizado correctamente';
        this.editMode = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      }
    } catch (error: any) {
      this.errorMessage = 'Error al guardar el perfil: ' + (error.message || 'Error desconocido');
    } finally {
      this.saving = false;
    }
  }

  async logout() {
    await this.supabase.signOut();
  }

  getInitials(): string {
    const givenName = this.userMetadata['given_name'] as string;
    const familyName = this.userMetadata['family_name'] as string;
    if (givenName && familyName) {
      return (givenName[0] + familyName[0]).toUpperCase();
    } else if (givenName) {
      return givenName.substring(0, 2).toUpperCase();
    }
    
    const nombre = this.profile.nombre || '';
    const apellidos = this.profile.apellidos || '';
    if (nombre && apellidos) {
      return (nombre[0] + apellidos[0]).toUpperCase();
    } else if (nombre) {
      return nombre.substring(0, 2).toUpperCase();
    } else if (this.userEmail) {
      return this.userEmail.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  getDisplayName(): string {
    if (this.displayName && this.displayName !== 'Mi Perfil') {
      return this.displayName;
    }
    
    if (this.profile.nombre && this.profile.apellidos) {
      return `${this.profile.nombre} ${this.profile.apellidos}`;
    } else if (this.profile.nombre) {
      return this.profile.nombre;
    }
    
    return this.userEmail || 'Usuario';
  }

  getFullName(): string {
    const fullName = this.userMetadata['full_name'] as string;
    if (fullName) {
      return fullName;
    }
    
    const givenName = this.userMetadata['given_name'] as string;
    const familyName = this.userMetadata['family_name'] as string;
    if (givenName || familyName) {
      return [givenName, familyName].filter(Boolean).join(' ');
    }
    
    if (this.profile.nombre && this.profile.apellidos) {
      return `${this.profile.nombre} ${this.profile.apellidos}`;
    } else if (this.profile.nombre) {
      return this.profile.nombre;
    }
    return '';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}
