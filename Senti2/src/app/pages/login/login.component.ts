import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthApiService } from '../../core/services/auth-api.service';

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
    private auth: AuthApiService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const token = this.route.snapshot.queryParams['token'];
    if (token) {
      this.router.navigateByUrl(this.getRedirectUrl());
    }
  }

  private getRedirectUrl(): string {
    const fromQuery = this.route.snapshot.queryParams['redirect'];
    if (fromQuery && typeof fromQuery === 'string' && fromQuery.startsWith('/')) {
      return fromQuery;
    }
    const fromStorage = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('login_redirect') : null;
    if (fromStorage) {
      sessionStorage.removeItem('login_redirect');
      return fromStorage;
    }
    return '/inicio';
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
      const { data, error } = await this.auth.signIn(this.email, this.password);
      if (error) throw error;
      const redirect = this.route.snapshot.queryParams['redirect'];
      if (redirect && redirect.startsWith('/')) {
        this.router.navigateByUrl(redirect);
      } else {
        const role = this.auth.getCurrentUserValue()?.role;
        this.router.navigateByUrl(role === 'admin' || role === 'psicologo' ? '/admin' : '/inicio');
      }
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
      const { data, error } = await this.auth.signUp(this.email, this.password);
      if (error) throw error;
      const redirect = this.route.snapshot.queryParams['redirect'];
      this.router.navigateByUrl(redirect && redirect.startsWith('/') ? redirect : '/inicio');
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al registrarse. Por favor, intenta de nuevo.';
    } finally {
      this.loading = false;
    }
  }
}
