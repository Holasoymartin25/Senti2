import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { environment } from '../../../environments/environment';

(window as any).Pusher = Pusher;

@Injectable({ providedIn: 'root' })
export class EchoService {
  private echo: Echo<any> | null = null;

  init(token: string) {
    const isHttps = window.location.protocol === 'https:';
    const currentPort = window.location.port
      ? Number(window.location.port)
      : (isHttps ? 443 : 80);

    if (this.echo) {
      try {
        this.echo.disconnect();
      } catch (_) {}
    }
    this.echo = new Echo({
      broadcaster: 'reverb',
      key: environment.reverb.key,
      wsHost: window.location.hostname || environment.reverb.host,
      wsPort: currentPort || environment.reverb.port,
      wssPort: currentPort || environment.reverb.port,
      forceTLS: isHttps,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: '/broadcasting/auth',
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

  listenToUserNotifications(userId: number, callback: (event: any) => void) {
    if (!this.echo) return;
    const channelName = `App.Models.User.${userId}`;
    this.echo.private(channelName).listen('MessageSent', callback);
  }

  leaveUserNotifications(userId: number) {
    if (!this.echo) return;
    const channelName = `App.Models.User.${userId}`;
    this.echo.leave(channelName);
  }

  disconnect() {
    this.echo?.disconnect();
    this.echo = null;
  }
}