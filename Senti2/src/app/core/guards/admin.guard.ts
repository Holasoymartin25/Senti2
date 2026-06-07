import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthApiService } from '../services/auth-api.service';
import { environment } from '../../../environments/environment';

export const adminGuard: CanActivateFn = async () => {
  const authApi = inject(AuthApiService);
  const router = inject(Router);

  const token = authApi.getToken();
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  await authApi.waitForInit();

  let user = authApi.getCurrentUserValue();
  if (!user) {
    const verified = await authApi.verifyToken(token);
    if (verified) {
      user = verified;
    }
  }

  if (user?.role === 'admin') {
    window.location.href = environment.adminPanelUrl;
    return false;
  }

  if (user?.role === 'psicologo') {
    return true;
  }

  router.navigate(['/inicio']);
  return false;
};
