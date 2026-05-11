import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
    id: string;
    email?: string;
    name?: string;
    role?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthApiService {
    private apiUrl = environment.apiUrl;
    private _currentUser = new BehaviorSubject<User | null>(null);
    private tokenKey = 'auth_token';
    private refreshTokenKey = 'refresh_token';
    private userCacheKey = 'auth_user_cache';
    private initPromise: Promise<void> = Promise.resolve();

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.initSession();
    }

    private initSession() {
        const token = this.getToken();
        if (!token) return;

        const cached = this.readUserCache();
        if (cached) {
            // Usuario en caché: carga inmediata; verificación en segundo plano
            this._currentUser.next(cached);
            this.initPromise = Promise.resolve();
            this.verifyToken(token).then(user => {
                if (!user) this.clearAuth();
            });
        } else {
            // Sin caché: esperar a que el backend confirme el token
            this.initPromise = this.verifyToken(token).then(() => {});
        }
    }

    waitForInit(): Promise<void> {
        return this.initPromise;
    }

    private readUserCache(): User | null {
        try {
            const raw = sessionStorage.getItem(this.userCacheKey);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    private saveUserCache(user: User | null): void {
        if (user) {
            sessionStorage.setItem(this.userCacheKey, JSON.stringify(user));
        } else {
            sessionStorage.removeItem(this.userCacheKey);
        }
    }

    private getHeaders(): HttpHeaders {
        const token = this.getToken();
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
    }

    get currentUser$(): Observable<User | null> {
        return this._currentUser.asObservable().pipe(shareReplay(1));
    }

    getCurrentUserValue(): User | null {
        return this._currentUser.value;
    }

    async signUp(email: string, password: string): Promise<any> {
        try {
            const response: any = await firstValueFrom(
                this.http.post<any>(`${this.apiUrl}/auth/signup`, { email, password })
            );

            if (response.access_token) {
                this.setToken(response.access_token);
                this._currentUser.next(response.user);
                this.saveUserCache(response.user);
            }

            return { data: response, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error.error?.message || error.error?.error || 'Error al registrarse' }
            };
        }
    }

    async signIn(email: string, password: string): Promise<any> {
        try {
            const response: any = await firstValueFrom(
                this.http.post<any>(`${this.apiUrl}/auth/signin`, { email, password })
            );

            if (response.access_token) {
                this.setToken(response.access_token);
                if (response.refresh_token) {
                    this.setRefreshToken(response.refresh_token);
                }
                this._currentUser.next(response.user);
                this.saveUserCache(response.user);
                return { data: response, error: null };
            }

            return { data: null, error: { message: 'Error al iniciar sesión' } };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error.error?.error || 'Error al iniciar sesión' }
            };
        }
    }

    async signOut(): Promise<void> {
        const token = this.getToken();
        
        if (token) {
            try {
                await firstValueFrom(
                    this.http.post(`${this.apiUrl}/auth/signout`, {}, { headers: this.getHeaders() })
                );
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            }
        }

        this.clearAuth();
        this.router.navigate(['/inicio']);
    }

    async verifyToken(token?: string): Promise<User | null> {
        const tokenToUse = token || this.getToken();
        
        if (!tokenToUse) {
            return null;
        }

        try {
            const response: any = await firstValueFrom(
                this.http.post<any>(`${this.apiUrl}/auth/verify`, {}, {
                    headers: new HttpHeaders({ 'Authorization': `Bearer ${tokenToUse}` })
                })
            );

            if (response.user) {
                this._currentUser.next(response.user);
                this.saveUserCache(response.user);
                return response.user;
            }

            return null;
        } catch (error: any) {
            // Solo borrar sesión si el token es inválido (401). Red o 500 no deben borrar el token.
            if (error?.status === 401) {
                this.clearAuth();
            }
            return null;
        }
    }

    async getCurrentUser(): Promise<User | null> {
        const cached = this._currentUser.value;
        if (cached) {
            return cached;
        }
        const token = this.getToken();
        
        if (!token) {
            return null;
        }

        try {
            const response: any = await firstValueFrom(
                this.http.get<any>(`${this.apiUrl}/auth/user`, { headers: this.getHeaders() })
            );

            if (response.user) {
                this._currentUser.next(response.user);
                return response.user;
            }

            return null;
        } catch (error: any) {
            if (error?.status === 401) {
                this.clearAuth();
            }
            return null;
        }
    }

    async getUserDisplayName(userId: string): Promise<string> {
        try {
            const user = this.getCurrentUserValue() ?? (await this.getCurrentUser());
            if (user) {
                if ((user as any).name) {
                    return (user as any).name as string;
                }

                const profile = await this.getUserProfile(userId);
                if (profile && profile.nombre) {
                    const fullName = [profile.nombre, profile.apellidos].filter(Boolean).join(' ');
                    if (fullName.trim()) {
                        return fullName;
                    }
                }

                return user.email || 'Mi Perfil';
            }

            return 'Mi Perfil';
        } catch (error) {
            console.error('Error al obtener nombre de usuario:', error);
            const user = this.getCurrentUserValue() ?? (await this.getCurrentUser());
            return user?.email || 'Mi Perfil';
        }
    }

    async getUserProfile(userId: string): Promise<any> {
        try {
            const response: any = await firstValueFrom(
                this.http.get<any>(`${this.apiUrl}/profile`, { headers: this.getHeaders() })
            );

            return response;
        } catch (error) {
            return null;
        }
    }

    async updateUserProfile(profile: any): Promise<any> {
        try {
            const response: any = await firstValueFrom(
                this.http.put<any>(`${this.apiUrl}/profile`, profile, { headers: this.getHeaders() })
            );

            return response;
        } catch (error: any) {
            throw new Error(error.error?.error || 'Error al actualizar perfil');
        }
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.refreshTokenKey);
    }

    private setToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }

    private setRefreshToken(token: string): void {
        localStorage.setItem(this.refreshTokenKey, token);
    }

    async refreshAccessToken(): Promise<boolean> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return false;
        try {
            const response: any = await firstValueFrom(
                this.http.post<any>(`${this.apiUrl}/auth/refresh`, { refresh_token: refreshToken })
            );
            if (response?.access_token) {
                this.setToken(response.access_token);
                if (response.refresh_token) this.setRefreshToken(response.refresh_token);
                if (response.user) this._currentUser.next(response.user);
                return true;
            }
        } catch (error: any) {
            // Solo borrar sesión si el refresh token es inválido (401). Errores de red no deben borrar.
            if (error?.status === 401) {
                this.clearAuth();
            }
        }
        return false;
    }

    private clearAuth(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        this.saveUserCache(null);
        this._currentUser.next(null);
    }

}

