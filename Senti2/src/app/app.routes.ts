import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { ServiciosComponent } from './pages/servicios/servicios.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { PsicologosComponent } from './pages/psicologos/psicologos.component';
import { OrigenComponent } from './pages/origen/origen.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { AreaPersonalComponent } from './pages/area-personal/area-personal.component';
import { TestsEmocionalesComponent } from './pages/area-personal/tests-emocionales/tests-emocionales.component';
import { ChatApoyoComponent } from './pages/area-personal/chat-apoyo/chat-apoyo.component';
import { EstadisticasComponent } from './pages/area-personal/estadisticas/estadisticas.component';
import { RecursosEducativosComponent } from './pages/area-personal/recursos-educativos/recursos-educativos.component';
import { DiarioEmocionalComponent } from './pages/area-personal/diario-emocional/diario-emocional.component';
import { ProgramasBienestarComponent } from './pages/area-personal/programas-bienestar/programas-bienestar.component';
import { TestEjecucionComponent } from './pages/area-personal/test-ejecucion/test-ejecucion.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },

  { path: 'login', component: LoginComponent },
  { path: 'auth/callback', component: LoginComponent },

  { path: 'inicio', component: InicioComponent },
  { path: 'servicios', component: ServiciosComponent },
  { path: 'psicologos', component: PsicologosComponent },
  { path: 'origen', component: OrigenComponent },
  { path: 'contacto', component: ContactoComponent },

  { path: 'area-personal', component: AreaPersonalComponent, canActivate: [authGuard] },
  { path: 'area-personal/tests-emocionales', component: TestsEmocionalesComponent, canActivate: [authGuard] },
  { path: 'area-personal/tests-emocionales/ejecutar/:testId', component: TestEjecucionComponent, canActivate: [authGuard] },
  { path: 'area-personal/chat-apoyo', component: ChatApoyoComponent, canActivate: [authGuard] },
  { path: 'area-personal/estadisticas', component: EstadisticasComponent, canActivate: [authGuard] },
  { path: 'area-personal/recursos-educativos', component: RecursosEducativosComponent, canActivate: [authGuard] },
  { path: 'area-personal/diario-emocional', component: DiarioEmocionalComponent, canActivate: [authGuard] },
  { path: 'area-personal/programas-bienestar', component: ProgramasBienestarComponent, canActivate: [authGuard] },

  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },

  { path: '**', component: NotFoundComponent }
];
