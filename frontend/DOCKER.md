# Docker Setup - Soccer Stats Frontend

## Estructura de Docker

Este proyecto utiliza Docker para facilitar el desarrollo y despliegue. La configuración incluye:

- **Dockerfile**: Multi-stage build optimizado con Bun para máximo rendimiento
- **docker-compose.yml**: Configura solo el frontend y se conecta a la red existente del backend
- **.dockerignore**: Optimiza el tamaño de la imagen
- **server.js**: Servidor estático con Bun para servir la aplicación Angular (CSR)

## Requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Backend y base de datos deben estar ejecutándose en la red `soccer_stats_network`

## Comandos Principales

### Desarrollo Local (sin Docker)

```bash
bun install
# o
npm install

bun run start
# o
npm start
```

### Construcción y Ejecución con Docker

#### Iniciar el frontend

```bash
docker compose up -d

# Ver logs
docker compose logs -f frontend

# Detener servicio
docker compose down
```

#### Construir la imagen manualmente

```bash
docker build -t soccer_stats_frontend .
```

#### Reconstruir forzando cambios

```bash
docker compose up -d --build
```

## Estructura Multi-Stage Build

El Dockerfile utiliza un build de múltiples etapas con Bun:

1. **Stage 1 (builder) - `oven/bun:1-alpine`**:
   - Instala dependencias con Bun (mucho más rápido que npm)
   - Compila la aplicación Angular en modo producción (CSR)
   - Optimiza el bundle para producción

2. **Stage 2 (production) - `oven/bun:1-alpine`**:
   - Imagen ligera con Bun
   - Copia solo los archivos estáticos compilados
   - Sirve la aplicación con un servidor HTTP simple de Bun
   - Soporte completo para routing de Angular (SPA)

## Tipo de Renderizado

La aplicación se sirve como **CSR (Client-Side Rendering)**:
- ✅ Sin SSR para evitar problemas de compatibilidad con Docker
- ✅ Más simple y rápido de deployar
- ✅ Ideal para aplicaciones SPA
- ✅ Routing de Angular funcionando correctamente

## Variables de Entorno

Las variables de entorno se configuran en el `docker-compose.yml`:

```yaml
environment:
  NODE_ENV: production
```

## Puerto

- **Frontend**: 4000

## Comandos Útiles

### Reconstruir servicios

```bash
docker compose up -d --build
```

### Ver logs del frontend

```bash
docker compose logs -f frontend
```

### Ejecutar comandos dentro del contenedor frontend

```bash
docker compose exec frontend sh
```

### Limpiar el frontend

```bash
# Detener y eliminar contenedor
docker compose down

# Eliminar imagen
docker rmi soccer_stats_frontend
```

## Arquitectura de Red

El frontend se conecta a la red externa `soccer_stats_network` creada por el backend:

```yaml
networks:
  soccer_stats_network:
    external: true
    name: soccer_stats_network
```

Esto permite que el frontend se comunique con:
- `api` (contenedor del backend)
- `mysql` (base de datos)
- `redis` (caché)

## Archivos Importantes

### `server.js`
Servidor HTTP simple con Bun que:
- Sirve archivos estáticos desde `./public`
- Maneja el routing de Angular (redirige todo a `index.html`)
- Configurado para correr en el puerto 4000

### `angular.json`
Configuración de Angular para build CSR:
- Sin `server` ni `ssr` configurado
- `outputPath`: `dist/frontend`
- Build optimizado para producción

### `.dockerignore`
Excluye archivos innecesarios del build:
- `node_modules`
- `dist`
- `.angular`
- Archivos de IDE y OS

## Optimizaciones de Rendimiento

- **Bun**: 3-5x más rápido que Node.js para instalar dependencias
- **Multi-stage build**: Reduce el tamaño final de la imagen
- **Cache de Docker**: Aprovecha las capas cacheadas
- **Archivos estáticos**: Servidos directamente sin procesamiento
- **Gzip**: Automáticamente manejado por Bun

## Producción

Para producción, considera:

1. **Variables de entorno seguras**: Usa Docker secrets o variables de entorno del sistema
2. **Reverse proxy**: Usa Nginx o Traefik delante de los servicios para:
   - SSL/TLS termination
   - Load balancing
   - Rate limiting
   - Caching adicional
3. **HTTPS**: Configura certificados SSL/TLS (Let's Encrypt recomendado)
4. **Monitoreo**: Implementa logs centralizados y métricas
5. **CDN**: Considera usar un CDN para servir los assets estáticos
6. **Compresión**: Habilita compresión adicional en el reverse proxy

### Ejemplo de configuración Nginx como reverse proxy

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Pasos para Levantar el Proyecto Completo

### 1. Levantar el Backend (primero)

```bash
# En el directorio del backend
cd ../backend
docker compose up -d
```

Esto creará:
- La red `soccer_stats_network`
- El contenedor de MySQL
- El contenedor de Redis
- El contenedor del API

### 2. Levantar el Frontend

```bash
# En el directorio del frontend
docker compose up -d
```

### 3. Verificar que todo esté funcionando

```bash
# Ver todos los contenedores
docker ps

# Verificar los logs del frontend
docker compose logs -f frontend

# Verificar la salud del contenedor
docker compose ps
```

### 4. Acceder a la aplicación

- **Frontend**: http://localhost:4000
- **Backend API**: http://localhost:3000

## Troubleshooting

### El frontend no puede conectar con el backend

Verifica que la URL del API esté configurada correctamente en `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://api:3000/api'  // Usa el nombre del contenedor del backend
};
```

**Nota**: En producción, deberías usar la URL real de tu API, no el nombre del contenedor.

Verificar que el frontend esté en la misma red:
```bash
docker network inspect soccer_stats_network
```

### Cambios no se reflejan

```bash
docker compose down
docker compose up -d --build
```

### El contenedor frontend no inicia

Ver logs para diagnosticar:
```bash
docker compose logs frontend
```

Verificar que la red externa existe (debe ser creada por el backend):
```bash
docker network ls | grep soccer_stats_network
```

Si la red no existe, levanta primero el backend.

### Error de construcción con Bun

Si tienes problemas con Bun, puedes verificar la versión:
```bash
docker run --rm oven/bun:1-alpine bun --version
```

### El contenedor se reinicia constantemente

Verificar el health check:
```bash
docker inspect soccer_stats_frontend
```

Verificar que el puerto 4000 esté disponible en tu sistema.

## Comandos Útiles Adicionales

### Limpiar todo y empezar de cero

```bash
# Detener y eliminar contenedores
docker compose down

# Eliminar imagen
docker rmi frontend-frontend

# Limpiar caché de Docker
docker builder prune

# Reconstruir todo desde cero
docker compose up -d --build --force-recreate
```

### Inspeccionar el contenedor

```bash
# Entrar al contenedor
docker compose exec frontend sh

# Ver archivos servidos
docker compose exec frontend ls -la /app/public

# Ver logs en tiempo real
docker compose logs -f frontend

# Ver estadísticas de recursos
docker stats soccer_stats_frontend
```

### Verificar la aplicación

```bash
# Verificar que el servidor responde
curl http://localhost:4000

# Verificar el health check
curl http://localhost:4000/index.html

# Verificar desde el navegador
open http://localhost:4000  # macOS
xdg-open http://localhost:4000  # Linux
start http://localhost:4000  # Windows
```

## Notas Adicionales

- La aplicación se compila en **modo producción** automáticamente
- El servidor Bun es extremadamente rápido y ligero
- El routing de Angular funciona correctamente (SPA)
