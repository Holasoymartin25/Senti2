import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.aws';

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

  constructor(private http: HttpClient) {}

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
    return this.http.patch(`${this.apiUrl}/messages/${senderId}/read`, {});
  }
}