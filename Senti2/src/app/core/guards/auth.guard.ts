import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthApiService } from '../services/auth-api.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authApi = inject(AuthApiService);
  const router = inject(Router);

  const token = authApi.getToken();
  
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const user = await authApi.verifyToken(token);

  if (user) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
