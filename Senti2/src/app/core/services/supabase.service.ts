import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient;
    private _currentUser = new BehaviorSubject<User | null>(null);

    constructor(private router: Router) {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
        this.initSession();
    }

    private async initSession() {
        // Manejar el callback de OAuth si existe
        const { data: { session }, error } = await this.supabase.auth.getSession();
        
        if (error) {
            console.error('Error getting session:', error);
        }

        if (session) {
            this._currentUser.next(session.user);
            // Si hay una sesión y estamos en la página de login, redirigir
            if (this.router.url === '/' || this.router.url === '/login') {
                this.router.navigate(['/inicio']);
            }
        } else {
            this._currentUser.next(null);
        }

        // Escuchar cambios en el estado de autenticación
        this.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this._currentUser.next(session.user);
                // Redirigir a inicio después de login exitoso
                if (this.router.url === '/' || this.router.url === '/login') {
                    this.router.navigate(['/inicio']);
                }
            } else if (event === 'SIGNED_OUT') {
                this._currentUser.next(null);
                this.router.navigate(['/']);
            } else if (event === 'TOKEN_REFRESHED' && session) {
                this._currentUser.next(session.user);
            }
        });
    }

    get currentUser$(): Observable<User | null> {
        return this._currentUser.asObservable();
    }

    async signUp(email: string, password: string): Promise<any> {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
        });
        return { data, error };
    }

    async signIn(email: string, password: string): Promise<any> {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (data.user) {
            this._currentUser.next(data.user);
        }
        return { data, error };
    }

    async signInWithGoogle(): Promise<any> {
        const { data, error } = await this.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/inicio`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
            }
        });
        
        if (error) {
            return { data: null, error };
        }
        
        // Si hay una URL de redirección, el navegador será redirigido automáticamente
        // No necesitamos hacer nada más aquí
        return { data, error: null };
    }

    async signOut(): Promise<void> {
        await this.supabase.auth.signOut();
        this._currentUser.next(null);
        this.router.navigate(['/login']);
    }

    async getSession(): Promise<Session | null> {
        const { data } = await this.supabase.auth.getSession();
        return data.session;
    }
}
