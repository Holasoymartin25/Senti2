import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApiService } from '../services/auth-api.service';
import { RoleService } from '../services/role.service';

export const adminRoleGuard: CanActivateFn = async () => {
  const authApi = inject(AuthApiService);
  const roleService = inject(RoleService);
  const router = inject(Router);

  if (!authApi.getToken()) {
    router.navigate(['/login']);
    return false;
  }

  const role = await roleService.loadRole();
  if (role === 'admin' || role === 'psicologo') {
    return true;
  }

  router.navigate(['/inicio']);
  return false;
};
