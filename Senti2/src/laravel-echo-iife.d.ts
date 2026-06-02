declare module 'laravel-echo/iife' {
  interface EchoChannel<T = unknown> {
    listen(event: string, callback: (data: T) => void): EchoChannel<T>;
  }

  export default class Echo<T = unknown> {
    constructor(options: Record<string, unknown>);
    disconnect(): void;
    private(channel: string): EchoChannel<T>;
    leave(channel: string): void;
  }
}
