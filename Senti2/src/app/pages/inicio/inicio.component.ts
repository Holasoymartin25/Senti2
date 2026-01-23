import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {

  constructor(private authService: AuthService, private router: Router) { }

  handleStart() {
    if (this.authService.isLogged()) {
      this.router.navigate(['/contacto']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}

