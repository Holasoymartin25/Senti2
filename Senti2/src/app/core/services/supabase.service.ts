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
        const { data } = await this.supabase.auth.getSession();
        if (data.session) {
            this._currentUser.next(data.session.user);
        } else {
            this._currentUser.next(null);
        }

        this.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this._currentUser.next(session.user);
            } else if (event === 'SIGNED_OUT') {
                this._currentUser.next(null);
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
        });
        return { data, error };
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
