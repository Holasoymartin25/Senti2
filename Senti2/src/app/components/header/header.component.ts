import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthApiService } from '../../core/services/auth-api.service';
import { from, Subscription } from 'rxjs';
import { switchMap, catchError, shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  displayName = 'Mi Perfil';
  userEmail = '';
  userRole = '';
  private subs: Subscription[] = [];

  constructor(
    public authApi: AuthApiService
  ) { }

  ngOnInit() {
    const userName$ = this.authApi.currentUser$.pipe(
      switchMap((user) => {
        if (user) {
          return from(this.authApi.getUserDisplayName(user.id)).pipe(
            catchError(() => of(user.email || 'Mi Perfil'))
          );
        }
        return of('Login');
      }),
      shareReplay(1)
    );

    this.subs.push(
      this.authApi.currentUser$.subscribe((user) => {
        this.isAuthenticated = !!user;
        this.userEmail = user?.email || '';
        this.userRole = user?.role || '';
      })
    );
    this.subs.push(
      userName$.subscribe((name) => { this.displayName = name as string; })
    );
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
