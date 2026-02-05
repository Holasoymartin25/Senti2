import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ChatHistoryItem {
  role: 'user' | 'assistant';
  text: string;
}

interface ChatResponse {
  reply: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatAiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async ask(message: string, history: ChatHistoryItem[]): Promise<string> {
    const payload = {
      message,
      history: history
        .slice(-8)
        .map(item => ({ role: item.role, content: item.text }))
    };

    const response = await firstValueFrom(
      this.http.post<ChatResponse>(`${this.apiUrl}/chat/ask`, payload)
    );

    return response?.reply || '';
  }
}
