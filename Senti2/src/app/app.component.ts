import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SupabaseService } from './core/services/supabase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showHeaderFooter = true;

  constructor(
    private router: Router,
    private supabase: SupabaseService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Ocultar header y footer en la página de login (ruta raíz)
      this.showHeaderFooter = event.url !== '/' && event.url !== '/login';
    });
  }

  async ngOnInit() {
    // Manejar el callback de OAuth si existe en la URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const error = hashParams.get('error');
    
    if (error) {
      console.error('Error en OAuth:', error);
      this.router.navigate(['/']);
      return;
    }

    // Si hay un token de acceso, Supabase lo manejará automáticamente
    // Solo necesitamos esperar a que se procese
    if (accessToken) {
      // Limpiar el hash de la URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
}
