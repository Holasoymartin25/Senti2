/** Producción en AWS: front y API comparten origen; Reverb va por nginx (/app). */
export const environment = {
  production: true,
  apiUrl: '/api/v1',
  reverb: {
    key: 'senti2-key',
    // EchoService usa window.location en producción; estos valores no se usan en AWS.
    host: '',
    port: 80,
    scheme: 'http',
  },
};
