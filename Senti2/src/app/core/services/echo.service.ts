import { Injectable } from '@angular/core';
import Echo from 'laravel-echo/iife';
import { environment } from '../../../environments/environment';

/** Pusher se carga como script global (angular.json) para evitar ESM en producción. */
declare const Pusher: new (key: string, options: Record<string, unknown>) => unknown;

@Injectable({ providedIn: 'root' })
export class EchoService {
  private echo: Echo<any> | null = null;

  init(token: string) {
    if (typeof Pusher === 'undefined') {
      console.warn('Pusher no está cargado; el chat en tiempo real no estará disponible.');
      return;
    }

    (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

    const isHttps = window.location.protocol === 'https:';
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    let wsHost: string;
    let wsPort: number;
    let forceTLS: boolean;

    const reverbHost = environment.reverb?.host?.trim();
    if (isLocalhost && reverbHost) {
      wsHost = reverbHost;
      wsPort = environment.reverb?.port ?? 8080;
      forceTLS = environment.reverb?.scheme === 'https';
    } else {
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
      cluster: '',
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
