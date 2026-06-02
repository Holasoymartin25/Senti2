/** Producción en AWS: front y API comparten origen; Reverb va por nginx (/app). */
export const environment = {
  production: true,
  apiUrl: '/api/v1',
  reverb: {
    key: 'senti2-key',
    // En local: localhost. En AWS Echo usa window.location (no este host).
    host: 'localhost',
    port: 80,
    scheme: 'http',
  },
};
