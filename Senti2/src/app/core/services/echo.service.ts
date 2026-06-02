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
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    const sameOriginApi = !environment.apiUrl.includes('://');

    let wsHost: string;
    let wsPort: number;
    let forceTLS: boolean;

    if (isLocalhost && environment.reverb?.host) {
      // Desarrollo: conexión directa a `php artisan reverb:start` (puerto 8080).
      wsHost = environment.reverb.host;
      wsPort = environment.reverb.port ?? 8080;
      forceTLS = environment.reverb.scheme === 'https';
    } else {
      // Producción (AWS): mismo host que el front; nginx termina TLS y enruta /app.
      wsHost = window.location.hostname;
      wsPort = window.location.port
        ? Number(window.location.port)
        : isHttps
          ? 443
          : 80;
      forceTLS = isHttps;
    }

    const apiHost = environment.apiUrl.includes('://')
      ? environment.apiUrl.split('/api/v1')[0]
      : sameOriginApi
        ? ''
        : '';
    const authEndpoint = `${apiHost}/broadcasting/auth`;

    if (this.echo) {
      try {
        this.echo.disconnect();
      } catch (_) {}
    }

    this.echo = new Echo({
      broadcaster: 'reverb',
      key: environment.reverb?.key || 'senti2-key',
      wsHost,
      wsPort,
      wssPort: wsPort,
      forceTLS,
      enabledTransports: ['ws', 'wss'],
      authEndpoint,
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
