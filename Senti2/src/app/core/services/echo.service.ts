import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { environment } from '../../../environments/environment.aws';

(window as any).Pusher = Pusher;

@Injectable({ providedIn: 'root' })
export class EchoService {
  private echo: Echo<any> | null = null;

  init(token: string) {
    this.echo = new Echo({
      broadcaster: 'reverb',
      key: environment.reverb.key,
      wsHost: environment.reverb.host,
      wsPort: environment.reverb.port,
      wssPort: environment.reverb.port,
      forceTLS: environment.reverb.scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  listenToChat(id1: number, id2: number, callback: (msg: any) => void) {
    if (!this.echo) return;
    const channelName = `chat.${Math.min(id1, id2)}.${Math.max(id1, id2)}`;
    this.echo.private(channelName).listen('MessageSent', callback);
  }

  leaveChat(id1: number, id2: number) {
    if (!this.echo) return;
    const channelName = `chat.${Math.min(id1, id2)}.${Math.max(id1, id2)}`;
    this.echo.leave(channelName);
  }

  disconnect() {
    this.echo?.disconnect();
    this.echo = null;
  }
}