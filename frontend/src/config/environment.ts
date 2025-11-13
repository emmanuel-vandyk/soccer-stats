/**
 * Environment configuration - Default (Docker)
 *
 * Este archivo es reemplazado según el script que uses:
 * - npm run start → usa environment.docker.ts (puerto 3000)
 * - npm run start:local → usa environment.localhost.ts (puerto 3001)
 */

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

