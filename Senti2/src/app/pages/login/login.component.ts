import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  loading = false;
  isRegisterMode = false;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];
      
      if (error) {
        this.errorMessage = decodeURIComponent(error);
        this.loading = false;
      }
      
      if (token) {
        this.router.navigate(['/inicio']);
      }
    });
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.successMessage = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }

  async onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const { data, error } = await this.supabase.signIn(this.email, this.password);
      if (error) throw error;
      this.router.navigate(['/inicio']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.';
    } finally {
      this.loading = false;
    }
  }

  async onRegister() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const { data, error } = await this.supabase.signUp(this.email, this.password);
      if (error) throw error;
      this.successMessage = '¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta.';
      // Limpiar formulario
      this.email = '';
      this.password = '';
      this.confirmPassword = '';
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al registrarse. Por favor, intenta de nuevo.';
    } finally {
      this.loading = false;
    }
  }

  async onGoogleLogin() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const { error } = await this.supabase.signInWithGoogle();
      if (error) throw error;
      // Redirect happens automatically
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al iniciar sesión con Google. Por favor, intenta de nuevo.';
      this.loading = false;
    }
  }
}
