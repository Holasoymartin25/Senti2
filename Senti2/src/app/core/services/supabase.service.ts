import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

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
        const { data: { session }, error } = await this.supabase.auth.getSession();
        
        if (error) {
            console.error('Error getting session:', error);
        }

        if (session) {
            this._currentUser.next(session.user);
            if (session.user) {
                await this.ensureUserProfile(session.user.id);
            }
            if (this.router.url === '/' || this.router.url === '/login') {
                this.router.navigate(['/inicio']);
            }
        } else {
            this._currentUser.next(null);
        }

        this.supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this._currentUser.next(session.user);
                if (session.user) {
                    await this.ensureUserProfile(session.user.id);
                }
                if (this.router.url === '/' || this.router.url === '/login') {
                    this.router.navigate(['/inicio']);
                }
            } else if (event === 'SIGNED_OUT') {
                this._currentUser.next(null);
                this.router.navigate(['/']);
            } else if (event === 'TOKEN_REFRESHED' && session) {
                this._currentUser.next(session.user);
            } else if (event === 'USER_UPDATED' && session) {
                this._currentUser.next(session.user);
            }
        });
    }

    get currentUser$(): Observable<User | null> {
        return this._currentUser.asObservable().pipe(
            shareReplay(1)
        );
    }

    async signUp(email: string, password: string): Promise<any> {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
        });
        if (data.user && !error) {
            await this.ensureUserProfile(data.user.id);
        }
        return { data, error };
    }

    async signIn(email: string, password: string): Promise<any> {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (data.user) {
            this._currentUser.next(data.user);
            await this.ensureUserProfile(data.user.id);
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
        
        return { data, error: null };
    }

    async signOut(): Promise<void> {
        await this.supabase.auth.signOut();
        this._currentUser.next(null);
        this.router.navigate(['/login']);
    }

    async getSession(): Promise<Session | null> {
        const { data } = await this.supabase.auth.getSession();
        if (data.session) {
            this._currentUser.next(data.session.user);
        } else {
            this._currentUser.next(null);
        }
        return data.session;
    }

    async refreshUserState(): Promise<void> {
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
            this._currentUser.next(session.user);
        } else {
            this._currentUser.next(null);
        }
    }

    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await this.supabase.auth.getUser();
        return user;
    }

    async ensureUserProfile(userId: string): Promise<void> {
        try {
            const existingProfile = await this.getUserProfile(userId);
            if (!existingProfile) {
                await this.createUserProfile(userId);
            }
        } catch (error) {
            console.error('Error al asegurar el perfil del usuario:', error);
        }
    }

    async createUserProfile(userId: string): Promise<any> {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .insert([
                    {
                        user_id: userId,
                        nombre: '',
                        apellidos: '',
                        telefono: '',
                        fecha_nacimiento: null
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error('Error al crear perfil:', error);
                if (error.code === '42P01' || error.message?.includes('does not exist')) {
                    console.error('La tabla "profiles" no existe en Supabase.');
                }
                return null;
            }

            return data;
        } catch (error: any) {
            console.error('Error inesperado al crear perfil:', error);
            return null;
        }
    }

    async getUserProfile(userId: string): Promise<any> {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                if (error.code === '42P01' || error.message?.includes('does not exist')) {
                    console.error('La tabla "profiles" no existe en Supabase.');
                } else {
                    console.error('Error al obtener perfil:', error);
                }
                return null;
            }

            return data;
        } catch (error: any) {
            console.error('Error inesperado al obtener perfil:', error);
            return null;
        }
    }

    async updateUserProfile(profile: any): Promise<any> {
        const { data, error } = await this.supabase
            .from('profiles')
            .update({
                nombre: profile.nombre || '',
                apellidos: profile.apellidos || '',
                telefono: profile.telefono || '',
                fecha_nacimiento: profile.fecha_nacimiento || null,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', profile.user_id)
            .select()
            .single();

        if (error) {
            console.error('Error al actualizar perfil:', error);
            throw error;
        }

        return data;
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
}
