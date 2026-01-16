import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) {}

  login() {
    localStorage.setItem('logged', 'true');
    this.router.navigate(['/inicio']);
  }


  logout() {
    localStorage.removeItem('logged');
    this.router.navigate(['/login']);
  }

  isLogged(): boolean {
    return localStorage.getItem('logged') === 'true';
  }
}
