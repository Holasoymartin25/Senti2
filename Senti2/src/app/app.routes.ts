import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { ServiciosComponent } from './pages/servicios/servicios.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { PsicologosComponent } from './pages/psicologos/psicologos.component';
import { OrigenComponent } from './pages/origen/origen.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { PerfilComponent } from './pages/perfil/perfil.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },

  { path: 'login', redirectTo: '', pathMatch: 'full' },
  
  { path: 'auth/callback', component: LoginComponent },

  {
    path: 'inicio',
    component: InicioComponent,
    canActivate: [authGuard]
  },
  {
    path: 'servicios',
    component: ServiciosComponent,
    canActivate: [authGuard]
  },

  {
    path: 'psicologos',
    component: PsicologosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'origen',
    component: OrigenComponent,
    canActivate: [authGuard]
  },

  {
    path: 'contacto',
    component: ContactoComponent
  },
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: 'login' }
];
