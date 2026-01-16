import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  const session = await supabase.getSession();

  if (session || true) { // TEMPORARY BYPASS FOR DEMO
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
