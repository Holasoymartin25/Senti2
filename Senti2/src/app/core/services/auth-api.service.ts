import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface User {
    id: string;
    email?: string;
    user_metadata?: any;
}

@Injectable({
    providedIn: 'root'
})
export class AuthApiService {
    private apiUrl = environment.apiUrl;
    private _currentUser = new BehaviorSubject<User | null>(null);
    private tokenKey = 'auth_token';
    private refreshTokenKey = 'refresh_token';

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.initSession();
    }

    private initSession() {
        const token = this.getToken();
        if (token) {
            this.verifyToken(token).then(user => {
                if (user) {
                    this._currentUser.next(user);
                } else {
                    this.clearAuth();
                }
            });
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

    async signUp(email: string, password: string, confirmPassword: string): Promise<any> {
        try {
            const response: any = await this.http.post(`${this.apiUrl}/auth/signup`, {
                email,
                password,
                confirmPassword
            }).toPromise();
            return { data: response, error: null };
        } catch (err: any) {
            return { data: null, error: { message: err?.error?.error ?? 'Error al registrarse' } };
        }
    }

    async signIn(email: string, password: string): Promise<any> {
        try {
            const response: any = await this.http.post(`${this.apiUrl}/auth/signin`, {
                email,
                password
            }).toPromise();
            if (response?.access_token) {
                this.setToken(response.access_token);
                if (response.refresh_token) this.setRefreshToken(response.refresh_token);
                this._currentUser.next(response.user);
                return { data: response, error: null };
            }
            return { data: null, error: { message: 'Error al iniciar sesión' } };
        } catch (err: any) {
            return { data: null, error: { message: err?.error?.error ?? 'Error al iniciar sesión' } };
        }
    }

    async signInWithGoogle(): Promise<any> {
        try {
            const response: any = await this.http.get(`${this.apiUrl}/auth/google/url`).toPromise();
            
            if (response.url) {
                window.location.href = response.url;
                return { data: null, error: null };
            }

            return { data: null, error: { message: 'Error al obtener URL de Google' } };
        } catch (error: any) {
            console.error('Error al obtener URL de Google OAuth:', error);
            return {
                data: null,
                error: { message: error.error?.error || 'Error al iniciar sesión con Google' }
            };
        }
    }

    async signOut(): Promise<void> {
        const token = this.getToken();
        
        if (token) {
            try {
                await this.http.post(`${this.apiUrl}/auth/signout`, {}, {
                    headers: this.getHeaders()
                }).toPromise();
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            }
        }

        this.clearAuth();
        this.router.navigate(['/login']);
    }

    async verifyToken(token?: string): Promise<User | null> {
        const tokenToUse = token || this.getToken();
        
        if (!tokenToUse) {
            return null;
        }

        try {
            const response: any = await this.http.post(`${this.apiUrl}/auth/verify`, {}, {
                headers: new HttpHeaders({
                    'Authorization': `Bearer ${tokenToUse}`
                })
            }).toPromise();

            if (response.user) {
                return response.user;
            }

            return null;
        } catch (error) {
            this.clearAuth();
            return null;
        }
    }

    async getCurrentUser(): Promise<User | null> {
        const token = this.getToken();
        
        if (!token) {
            return null;
        }

        try {
            const response: any = await this.http.get(`${this.apiUrl}/auth/user`, {
                headers: this.getHeaders()
            }).toPromise();

            if (response.user) {
                this._currentUser.next(response.user);
                return response.user;
            }

            return null;
        } catch (error) {
            this.clearAuth();
            return null;
        }
    }

    async getUserDisplayName(userId: string): Promise<string> {
        try {
            const user = await this.getCurrentUser();
            if (user) {
                const metadata = user.user_metadata || {};
                
                if (metadata['full_name']) {
                    return metadata['full_name'] as string;
                }
                
                const givenName = metadata['given_name'] as string;
                const familyName = metadata['family_name'] as string;
                if (givenName || familyName) {
                    const fullName = [givenName, familyName].filter(Boolean).join(' ');
                    if (fullName.trim()) {
                        return fullName;
                    }
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
            const user = await this.getCurrentUser();
            return user?.email || 'Mi Perfil';
        }
    }

    async getUserProfile(userId: string): Promise<any> {
        try {
            const response: any = await this.http.get(`${this.apiUrl}/profile`, {
                headers: this.getHeaders()
            }).toPromise();

            return response;
        } catch (error) {
            return null;
        }
    }

    async updateUserProfile(profile: any): Promise<any> {
        try {
            const response: any = await this.http.put(`${this.apiUrl}/profile`, profile, {
                headers: this.getHeaders()
            }).toPromise();

            return response;
        } catch (error: any) {
            throw new Error(error.error?.error || 'Error al actualizar perfil');
        }
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    private setToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }

    private setRefreshToken(token: string): void {
        localStorage.setItem(this.refreshTokenKey, token);
    }

    private clearAuth(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        this._currentUser.next(null);
    }

    handleAuthCallback(token: string, refreshToken?: string): void {
        this.setToken(token);
        if (refreshToken) {
            this.setRefreshToken(refreshToken);
        }
        
        this.verifyToken(token).then(user => {
            if (user) {
                this._currentUser.next(user);
                this.router.navigate(['/inicio']);
            }
        });
    }
}

