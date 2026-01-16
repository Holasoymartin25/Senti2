import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'] // Reusing login styles or similar
})
export class RegistroComponent {
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';

  constructor(private supabase: SupabaseService, private router: Router) { }

  async onRegister() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    try {
      const { data, error } = await this.supabase.signUp(this.email, this.password);
      if (error) throw error;
      this.successMessage = 'Registro exitoso. Por favor revisa tu email para confirmar.';
      // Optional: Redirect after a few seconds
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }
}
