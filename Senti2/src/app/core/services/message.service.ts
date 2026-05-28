import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subscription, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthApiService } from './auth-api.service';
import { EchoService } from './echo.service';

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  read: boolean;
  created_at: string;
  sender: { id: number; name: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = environment.apiUrl;

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private messageReceivedSubject = new Subject<Message>();
  messageReceived$ = this.messageReceivedSubject.asObservable();

  activeChatUserId: number | null = null;
  private authSubscription!: Subscription;
  private listeningUserId: number | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthApiService,
    private echoService: EchoService
  ) {
    this.initUnreadCountListener();
  }

  private initUnreadCountListener() {
    this.authSubscription = this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          const userId = Number(user.id);
          this.reloadUnreadCount();
          
          // Suscribirse a las notificaciones en tiempo real si el usuario cambia
          if (this.listeningUserId !== userId) {
            if (this.listeningUserId) {
              this.echoService.leaveUserNotifications(this.listeningUserId);
            }
            this.listeningUserId = userId;
            
            // Inicializar Echo si no está inicializado
            const token = this.authService.getToken() || '';
            this.echoService.init(token);

            this.echoService.listenToUserNotifications(userId, (event: any) => {
              this.messageReceivedSubject.next(event);
              // Si no está chateando activamente con el remitente de este mensaje, se incrementa
              if (event.sender_id !== this.activeChatUserId) {
                this.incrementUnreadCount();
              }
            });
          }
        } else {
          // Si el usuario cierra sesión, limpiar
          if (this.listeningUserId) {
            this.echoService.leaveUserNotifications(this.listeningUserId);
            this.listeningUserId = null;
          }
          this.unreadCountSubject.next(0);
        }
      }
    });
  }

  getMessages(otherUserId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/messages/${otherUserId}`);
  }

  sendMessage(receiverId: number, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/messages`, {
      receiver_id: receiverId,
      content,
    });
  }

  markAsRead(senderId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/messages/${senderId}/read`, {}).pipe(
      tap(() => this.reloadUnreadCount())
    );
  }

  getUnreadCount(): Observable<{ unread_count: number }> {
    return this.http.get<{ unread_count: number }>(`${this.apiUrl}/messages/unread/count`);
  }

  reloadUnreadCount() {
    this.getUnreadCount().subscribe({
      next: (res) => {
        this.unreadCountSubject.next(res.unread_count);
      },
      error: () => {
        // Ignorar si falla la carga (ej. no autenticado todavía)
      }
    });
  }

  incrementUnreadCount(amount = 1) {
    this.unreadCountSubject.next(this.unreadCountSubject.value + amount);
  }
}