import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private supabase: SupabaseService, private router: Router) { }

  async onLogin() {
    try {
      const { data, error } = await this.supabase.signIn(this.email, this.password);
      if (error) throw error;
      this.router.navigate(['/inicio']);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  async onGoogleLogin() {
    try {
      const { error } = await this.supabase.signInWithGoogle();
      if (error) throw error;
      // Redirect happens automatically
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }
}
