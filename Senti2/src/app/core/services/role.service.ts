import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthApiService } from './auth-api.service';

export type UserRole = 'user' | 'psicologo' | 'admin';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private _role = new BehaviorSubject<UserRole | null>(null);

  get role$(): Observable<UserRole | null> {
    return this._role.asObservable();
  }

  get currentRole(): UserRole | null {
    return this._role.value;
  }

  get isAdminOrPsicologo(): boolean {
    const r = this._role.value;
    return r === 'admin' || r === 'psicologo';
  }

  constructor(private authApi: AuthApiService) {
    this.authApi.currentUser$.subscribe(async (user) => {
      if (!user) {
        this._role.next(null);
        return;
      }
      await this.loadRole();
    });
  }

  async loadRole(): Promise<UserRole | null> {
    try {
      const profile = await this.authApi.getUserProfile('');
      const role = (profile?.role ?? 'user') as UserRole;
      this._role.next(role);
      return role;
    } catch {
      this._role.next('user');
      return 'user';
    }
  }

  async refreshRole(): Promise<UserRole | null> {
    return this.loadRole();
  }
}
