# Soccer Stats Backend

FIFA Players Stats Manager - Backend API con Node.js, Express, TypeScript, Sequelize y MySQL.

## 🚀 Tecnologías

- **Runtime**: Bun 1.2.23
- **Framework**: Express 5.1.0
- **Database**: MySQL 8.4.6
- **ORM**: Sequelize 6.37.7
- **Authentication**: JWT (jsonwebtoken)
- **Cache**: Redis (ioredis)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## 📦 Instalación y Ejecución

### 🏠 Modo Localhost

Backend corre en tu máquina, bases de datos en Docker:

```bash
# 1. Levantar solo MySQL y Redis
docker compose up -d mysql redis

# 2. Ejecutar backend
bun start
```

**URLs:**
- Backend: `http://localhost:3000`
- MySQL: `localhost:3308`
- Redis: `localhost:6380`

---

### 🐳 Modo Docker

Todo corre en contenedores Docker:

```bash
# Levantar todos los servicios
docker compose up -d

# Ver logs del backend
docker compose logs -f api

# Detener todo
docker compose down
```

**URLs:**
- Backend: `http://localhost:3000`
- MySQL: `localhost:3308`
- Redis: `localhost:6380`

### 🎮 Jugador Personalizado (Opcional)

Esta aplicación incluye un script para cargar un jugador personalizado (Emma Van Dick - ID: 999999) ideal para demos y portfolio.

✅ **Fácil de ejecutar** - Un solo comando después de levantar Docker  
✅ **No borra datos existentes** - Se agrega a los jugadores de FIFA  
✅ **Perfecto para demos y portfolio** - Muestra datos personalizados  
✅ **Completamente personalizable** - Ver `scripts/dump-data/03-custom-player-seed.sql`

**Cargar el jugador personalizado:**
```bash
./scripts/seedCustomPlayer.sh
```

**Verificar que se cargó correctamente:**
```bash
npm run check-custom-player
```

**Personalizar el jugador:**
Edita `scripts/dump-data/03-custom-player-seed.sql` y ejecuta de nuevo:
```bash
./scripts/seedCustomPlayer.sh
```

Ver más detalles en [scripts/dump-data/README.md](./scripts/dump-data/README.md)

## 🔧 Scripts Disponibles

```bash
# Desarrollo
bun start            # Localhost (puerto 3000)

# Producción
bun run build        # Build para producción
bun run serve        # Ejecutar build de producción

# Utilidades
bun run typecheck    # Verificar tipos TypeScript
bun run clean        # Limpiar carpeta dist
```

**Para Docker:** Usa `docker compose up -d`

## 🔐 Seguridad Implementada

### Rate Limiting
Protección contra ataques de fuerza bruta:

- **Login/Register**: 5 intentos cada 15 minutos
- **Bloqueo temporal**: 15 minutos después de exceder el límite
- **Headers informativos**: `X-RateLimit-Remaining`, `X-RateLimit-Limit`

```bash
# Ejemplo de respuesta cuando se excede el límite:
HTTP/1.1 429 Too Many Requests
{
  "success": false,
  "error": "TOO_MANY_REQUESTS",
  "message": "Too many login attempts. Account temporarily locked for 15 minutes."
}
```

### Autenticación JWT
- **Token expiration**: 24 horas
- **Contraseñas**: Hash con bcrypt (10 rounds)
- **Mensajes genéricos**: No revela si el email existe
- **HttpOnly Cookies**: Opcional (configurable)

### Headers de Seguridad
- **Helmet**: Configuración automática de headers de seguridad
- **CORS**: Configurado para permitir solo orígenes autorizados
- **Content Security Policy**: Implementada

## 📚 API Endpoints

### Autenticación (Sin autenticación)
```
POST   /api/auth/login       - Login usuario
POST   /api/auth/register    - Registrar nuevo usuario
POST   /api/auth/logout      - Logout (limpiar cookies)
```

### Autenticación (Con JWT)
```
GET    /api/auth/me          - Obtener usuario actual
```

### Jugadores FIFA (Públicos)
```
GET    /api/fifa-players                    - Listar jugadores (paginado)
GET    /api/fifa-players/:id                - Detalle de jugador
GET    /api/fifa-players/:id/timeline       - Evolución del jugador
GET    /api/fifa-players/search?q=Messi     - Buscar jugadores
GET    /api/fifa-players/top-rated          - Top jugadores
GET    /api/fifa-players/versions           - Versiones FIFA disponibles
GET    /api/fifa-players/filter-metadata    - Metadata para filtros
```

### Jugadores (Protegidos con JWT)
```
GET    /api/players                         - Listar jugadores (auth)
GET    /api/players/:id                     - Detalle jugador (auth)
GET    /api/players/:id/radar-stats         - Stats para radar chart
GET    /api/players/:id/timeline            - Evolución temporal
GET    /api/players/search?q=nombre         - Buscar jugadores
GET    /api/players/top-rated               - Top rated (auth)
GET    /api/players/export?format=csv       - Exportar CSV/Excel
POST   /api/players                         - Crear jugador
PUT    /api/players/:id                     - Actualizar jugador
DELETE /api/players/:id                     - Eliminar jugador
```

## 🔍 Parámetros de Consulta

### Filtros
```
?name=Messi                  - Buscar por nombre
?clubName=Barcelona          - Filtrar por club
?nationalityName=Argentina   - Filtrar por nacionalidad
?position=ST                 - Filtrar por posición
?gender=M                    - Filtrar por género (M/F)
?fifaVersion=23              - Versión FIFA
?fifaUpdate=1                - Update FIFA
?overallMin=85               - Overall mínimo
?overallMax=95               - Overall máximo
?ageMin=20                   - Edad mínima
?ageMax=30                   - Edad máxima
```

### Paginación
```
?page=1                      - Número de página (default: 1)
?limit=20                    - Registros por página (default: 20, max: 1000)
?limit=-1                    - Traer TODOS los registros sin paginación
?sortBy=overall              - Ordenar por campo
?sortOrder=DESC              - Orden (ASC/DESC)
```

## 📊 Base de Datos

### Tabla `players`
- **Total registros**: 342,945 (todas las versiones FIFA)
- **Jugadores únicos**: 53,142 (nombre + nacionalidad)
- **Versiones FIFA**: 15, 16, 17, 18, 19, 20, 21, 22, 23

### Optimizaciones
- **Índices**: long_name, nationality_name, overall, fifa_version, gender
- **Deduplicación**: Última versión de cada jugador por defecto
- **Caché Redis**: 1 min / 5 min / 1 hora según endpoint

## 🔑 Variables de Entorno

**Para desarrollo local** (`.env`):
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3308
REDIS_HOST=localhost
REDIS_PORT=6380
```

**Para Docker**: Las variables están configuradas en `docker-compose.yml`

**Nota:** Tanto localhost como Docker usan el puerto 3000 para el backend.

## 🐳 Docker

```bash
# Levantar servicios (MySQL + Redis)
docker compose up -d

# Ver logs
docker compose logs -f

# Detener servicios
docker compose down
```

## 📝 Características Principales

✅ **CRUD completo** de jugadores  
✅ **Autenticación JWT** con rate limiting  
✅ **Exportación** a CSV y Excel  
✅ **Timeline** de evolución de jugadores  
✅ **Radar charts** para visualización de stats  
✅ **Filtros avanzados** y búsqueda  
✅ **Caché Redis** para optimización  
✅ **Paginación** y ordenamiento  
✅ **Validaciones** en backend  
✅ **Manejo de errores** con status codes correctos  

## 🛡️ Políticas de Seguridad

1. **Contraseñas**: Nunca se almacenan en texto plano (bcrypt hash)
2. **JWT Tokens**: Expiran en 24 horas
3. **Rate Limiting**: 5 intentos de login cada 15 minutos
4. **CORS**: Solo orígenes autorizados
5. **Helmet**: Headers de seguridad automáticos
6. **Validación**: express-validator en todos los endpoints
7. **SQL Injection**: Protección mediante Sequelize ORM

## 👨‍💻 Autor

Emmanuel Van Dick

## 📄 Licencia

MIT
