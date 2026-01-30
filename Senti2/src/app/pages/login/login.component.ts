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
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { data, error } = await this.supabase.signIn(this.email, this.password);
    this.loading = false;

    if (error) {
      this.errorMessage = error.message;
      return;
    }
    this.router.navigate(['/inicio']);
  }

  async onRegister() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { data, error } = await this.supabase.signUp(this.email, this.password, this.confirmPassword);
    this.loading = false;

    if (error) {
      this.errorMessage = error.message;
      return;
    }
    this.successMessage = data?.message ?? '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }

  async onGoogleLogin() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { error } = await this.supabase.signInWithGoogle();
    this.loading = false;
    if (error) this.errorMessage = error.message;
  }
}
