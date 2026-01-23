import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service';
import { Observable, from } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  userName$: Observable<string> = new Observable();
  isAuthenticated = false;

  constructor(
    public supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.userName$ = this.supabase.currentUser$.pipe(
      switchMap((user) => {
        this.isAuthenticated = !!user;
        if (user) {
          return from(this.supabase.getUserDisplayName(user.id)).pipe(
            catchError((error) => {
              console.error('Error obteniendo display name:', error);
              return of(user.email || 'Mi Perfil');
            })
          );
        }
        return of('Login');
      }),
      map((name) => {
        this.cdr.detectChanges();
        return name;
      })
    );

    this.supabase.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.cdr.detectChanges();
    });
  }
}
