import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthApiService } from '../services/auth-api.service';

export const adminGuard: CanActivateFn = async (route, state) => {
  const authApi = inject(AuthApiService);
  const router = inject(Router);

  const token = authApi.getToken();

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  let user = authApi.getCurrentUserValue();

  if (!user) {
    user = await authApi.verifyToken(token);
  }

  if (user?.role === 'admin') {
    return true;
  }

  router.navigate(['/inicio']);
  return false;
};
