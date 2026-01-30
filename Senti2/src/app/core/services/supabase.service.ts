import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { AuthApiService } from './auth-api.service';

interface User {
    id: string;
    email?: string;
    user_metadata?: any;
}

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private _currentUser = new BehaviorSubject<User | null>(null);

    constructor(
        private router: Router,
        private authApi: AuthApiService
    ) {
        this.initSession();
    }

    private async initSession() {
        this.authApi.currentUser$.subscribe(user => {
            this._currentUser.next(user);
        });

        const user = await this.authApi.getCurrentUser();
        if (user) {
            this._currentUser.next(user);
            if (this.router.url === '/' || this.router.url === '/login') {
                this.router.navigate(['/inicio']);
            }
        } else {
            this._currentUser.next(null);
        }
    }

    get currentUser$(): Observable<User | null> {
        return this.authApi.currentUser$.pipe(
            shareReplay(1)
        );
    }

    async signUp(email: string, password: string, confirmPassword: string): Promise<any> {
        return await this.authApi.signUp(email, password, confirmPassword);
    }

    async signIn(email: string, password: string): Promise<any> {
        const result = await this.authApi.signIn(email, password);
        if (result.data && !result.error) {
            this._currentUser.next(result.data.user);
        }
        return result;
    }

    async signInWithGoogle(): Promise<any> {
        return await this.authApi.signInWithGoogle();
    }

    async signOut(): Promise<void> {
        await this.authApi.signOut();
    }

    async getSession(): Promise<any> {
        const user = await this.authApi.getCurrentUser();
        if (user) {
            return { user, access_token: this.authApi.getToken() };
        }
        return null;
    }

    async refreshUserState(): Promise<void> {
        const user = await this.authApi.getCurrentUser();
        this._currentUser.next(user);
    }

    async getCurrentUser(): Promise<User | null> {
        return await this.authApi.getCurrentUser();
    }

    async getUserProfile(userId: string): Promise<any> {
        return await this.authApi.getUserProfile(userId);
    }

    async updateUserProfile(profile: any): Promise<any> {
        return await this.authApi.updateUserProfile(profile);
    }

    async getUserDisplayName(userId: string): Promise<string> {
        return await this.authApi.getUserDisplayName(userId);
    }
}
