import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../../core/services/auth-api.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {

  constructor(private authApi: AuthApiService, private router: Router) { }

  handleStart() {
    if (this.authApi.getToken()) {
      this.router.navigate(['/contacto']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
