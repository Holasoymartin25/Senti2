/** Producción en AWS (frontend y API en el mismo origen). */
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8000/api/v1',
  reverb: {
    key: 'senti2-key',
    host: 'localhost',
    port: 8080,
    scheme: 'http',
  }
};