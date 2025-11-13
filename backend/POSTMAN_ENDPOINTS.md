# 📋 Endpoints para Postman - Soccer Stats API

**Base URL:** `http://localhost:3000`

---

## 🔐 **1. AUTENTICACIÓN** (`/api/auth`)

### 1.1 Registro de Usuario
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/auth/register`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "username": "userdemo",
    "email": "user@demo.com",
    "password": "User123456!"
  }
  ```
- **Respuesta esperada:** Usuario creado con token JWT

---

### 1.2 Login
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "email": "user@demo.com",
    "password": "User123456!"
  }
  ```
- **Respuesta esperada:** Token JWT y datos del usuario

---

### 1.3 Obtener Usuario Actual (Protegido)
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/auth/me`
- **Headers:**
  ```
  Authorization: Bearer {tu_token_jwt}
  ```
- **Respuesta esperada:** Datos del usuario autenticado

---

## ⚽ **2. JUGADORES FIFA** (`/api/fifa-players`) - Públicos

### 2.1 Listar Jugadores (Con filtros y paginación)
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/fifa-players`
- **Query Params (opcionales):**
  - `name` - Filtrar por nombre (ej: `Messi`)
  - `club_name` - Filtrar por club (ej: `FC Barcelona`)
  - `nationality_name` - Filtrar por nacionalidad (ej: `Argentina`)
  - `position` - Filtrar por posición (ej: `ST`)
  - `gender` - Filtrar por género (ej: `M` o `F`)
  - `fifa_version` - Versión FIFA (ej: `15`)
  - `fifa_update` - Update FIFA (ej: `2`)
  - `overall_min` - Rating mínimo (ej: `85`)
  - `overall_max` - Rating máximo (ej: `95`)
  - `potential_min` - Potencial mínimo (ej: `90`)
  - `potential_max` - Potencial máximo (ej: `99`)
  - `age_min` - Edad mínima (ej: `20`)
  - `age_max` - Edad máxima (ej: `35`)
  - `page` - Número de página (ej: `1`)
  - `limit` - Resultados por página (ej: `20`)
  - `sort_by` - Ordenar por campo (ej: `overall`)
  - `sort_order` - Orden (ej: `DESC` o `ASC`)
- **Ejemplos:**
  ```
  # Jugadores con rating mayor a 85
  http://localhost:3000/api/fifa-players?overall-min=85&limit=10
  
  # Jugadores del Barcelona
  http://localhost:3000/api/fifa-players?club-name=FC Barcelona
  
  # Delanteros argentinos
  http://localhost:3000/api/fifa-players?nationality-name=Argentina&position=ST
  
  # Jugadoras femeninas con rating alto
  http://localhost:3000/api/fifa-players?gender=F&overall-min=80
  ```

---

### 2.2 Obtener Versiones Disponibles
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/fifa-players/versions`
- **Respuesta esperada:** Lista de versiones y updates disponibles en la BD

---

### 2.3 Top Jugadores Mejor Rankeados
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/fifa-players/top-rated`
- **Query Params (opcionales):**
  - `limit` - Cantidad de resultados (ej: `10`)
  - `fifa-version` - Filtrar por versión FIFA (ej: `15`)
  - `fifa-update` - Filtrar por update (ej: `2`)
  - `position` - Filtrar por posición (ej: `ST`)
  - `gender` - Filtrar por género (ej: `M` o `F`)
- **Ejemplos:**
  ```
  # Top 10 mejores jugadores
  http://localhost:3000/api/fifa-players/top-rated?limit=10
  
  # Top 5 mejores delanteros
  http://localhost:3000/api/fifa-players/top-rated?limit=5&position=ST
  
  # Top 10 mejores jugadoras femeninas
  http://localhost:3000/api/fifa-players/top-rated?limit=10&gender=F
  ```

---

### 2.4 Buscar Jugadores por Nombre
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/fifa-players/search`
- **Query Params:**
  - `q` - Texto de búsqueda (requerido)
  - `limit` - Resultados máximos (ej: `10`)
  - `fifa_version` - Filtrar por versión (ej: `15`)
  - `gender` - Filtrar por género (ej: `M` o `F`)
- **Ejemplos:**
  ```
  # Buscar "Messi"
  http://localhost:3000/api/fifa-players/search?q=Messi
  
  # Buscar "Cristiano" limitado a 5 resultados
  http://localhost:3000/api/fifa-players/search?q=Cristiano&limit=5
  
  # Buscar jugadoras con "Alex"
  http://localhost:3000/api/fifa-players/search?q=Alex&gender=F
  ```

---

### 2.5 Obtener Jugador por ID
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/fifa-players/:id`
- **Ejemplos:**
  ```
  # Jugador con ID 1 (masculino)
  http://localhost:3000/api/fifa-players/1
  
  # Jugadora con ID 1000001 (femenino)
  http://localhost:3000/api/fifa-players/1000001
  ```

---

### 2.6 Obtener Estadísticas Detalladas de Jugador
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/fifa-players/stats/:id`
- **Ejemplos:**
  ```
  http://localhost:3000/api/fifa-players/stats/1
  http://localhost:3000/api/fifa-players/stats/1000001
  ```

---

## 👤 **3. GESTIÓN DE JUGADORES** (`/api/players`) - Protegidos con Auth

> **⚠️ IMPORTANTE:** Todos estos endpoints requieren autenticación.
> Incluye el header: `Authorization: Bearer {tu_token_jwt}`

### 3.1 Buscar Jugadores
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/players/search`
- **Headers:**
  ```
  Authorization: Bearer {tu_token_jwt}
  ```
- **Query Params:**
  - `q` - Texto de búsqueda
  - `gender` - Filtrar por género (ej: `M` o `F`)
- **Ejemplo:**
  ```
  http://localhost:3000/api/players/search?q=Messi
  ```

---

### 3.2 Top Jugadores Mejor Rankeados
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/players/top-rated`
- **Headers:**
  ```
  Authorization: Bearer {tu_token_jwt}
  ```
- **Query Params:**
  - `fifa-version` - Versión FIFA
  - `limit` - Cantidad de resultados
  - `gender` - Filtrar por género (ej: `M` o `F`)
- **Ejemplo:**
  ```
  http://localhost:3000/api/players/top-rated?fifa-version=15&limit=10
  ```

---

### 3.3 Listar Jugadores con Filtros
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/players`
- **Headers:**
  ```
  Authorization: Bearer {tu_token_jwt}
  ```
- **Query Params:** (similares a /api/fifa-players)
  - `page`, `limit`, `sort-by`, `sort-order`
  - `overall-min`, `overall-max`
  - `position`, `club-name`, `nationality-name`
  - `gender` - Filtrar por género (ej: `M` o `F`)
- **Ejemplo:**
  ```
  http://localhost:3000/api/players?overall-min=85&gender=F
  ```

---

### 3.4 Obtener Jugador por ID
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/players/:id`
- **Headers:**
  ```
  Authorization: Bearer {tu_token_jwt}
  ```
- **Ejemplo:**
  ```
  http://localhost:3000/api/players/1
  ```

---

### 3.5 Estadísticas Radar del Jugador
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/players/:id/radar-stats`
- **Headers:**
  ```
  Authorization: Bearer {tu_token_jwt}
  ```
- **Descripción:** Datos preparados para gráficos de radar (Chart.js)
- **Ejemplo:**
  ```
  http://localhost:3000/api/players/1/radar-stats
  ```

---

### 3.6 Timeline de Evolución del Jugador
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/players/:id/timeline`
- **Headers:**
  ```
  Authorization: Bearer {tu_token_jwt}
  ```
- **Query Params:**
  - `skill` - Habilidad específica a trackear (ej: `pace`, `shooting`)
- **Descripción:** Evolución del jugador a través de versiones FIFA
- **Ejemplo:**
  ```
  http://localhost:3000/api/players/1/timeline?skill=pace
  ```

---

## 🏥 **4. HEALTH CHECK**

### 4.1 Verificar Estado del Servidor
- **Método:** `GET`
- **URL:** `http://localhost:3000/`
- **Respuesta esperada:**
  ```json
  {
    "status": "Server OK",
    "timestamp": "2025-10-27T..."
  }
  ```

---

## 📝 **NOTAS IMPORTANTES**

### IDs de Jugadores:
- **Jugadores masculinos:** IDs del **1 al 161,583**
- **Jugadoras femeninas:** IDs del **1,000,001 al 1,181,361**

### Filtro de Género:
- Puedes agregar `?gender=M` para jugadores masculinos
- Puedes agregar `?gender=F` para jugadoras femeninas
- **IMPORTANTE:** Las jugadoras femeninas están disponibles a partir de FIFA 16 en adelante (FIFA 15 solo tiene jugadores masculinos)

### Headers Comunes:
```
Content-Type: application/json
Authorization: Bearer {token}  // Solo para endpoints protegidos
```

### Ejemplo de Token JWT:
Después de login/register recibirás algo como:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

Usa ese token en los headers de endpoints protegidos:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 **EJEMPLOS DE PRUEBAS RECOMENDADAS**

### Secuencia de Pruebas:

1. **Health Check** → Verificar que el servidor esté corriendo
2. **Register** → Crear una cuenta
3. **Login** → Obtener token JWT
4. **Auth Me** → Verificar autenticación con el token
5. **FIFA Players (público)** → Probar búsquedas sin auth
6. **Players (protegido)** → Probar con token JWT

### Casos de Prueba Específicos:

```bash
# 1. Top 10 mejores jugadores masculinos
GET /api/fifa-players/top-rated?limit=10&gender=M

# 2. Top 10 mejores jugadoras femeninas (FIFA 16+)
GET /api/fifa-players/top-rated?limit=10&gender=F&fifa-version=16

# 3. Buscar "Messi" (debería dar Lionel Messi - ID: 1)
GET /api/fifa-players/search?q=Messi

# 4. Jugadores del Barcelona con rating alto
GET /api/fifa-players?club-name=FC Barcelona&overall-min=85

# 5. Delanteras argentinas (FIFA 16+)
GET /api/fifa-players?nationality-name=Argentina&position=ST&gender=F&fifa-version=16

# 6. Ver perfil completo de Messi (ID: 1)
GET /api/fifa-players/1

# 7. Estadísticas radar de Messi
GET /api/players/1/radar-stats
(Requiere token)
```

---

## 🚀 **IMPORTAR A POSTMAN**

### Opción 1: Crear Collection Manualmente
1. Crea una nueva Collection en Postman
2. Agrega las carpetas: `Auth`, `FIFA Players`, `Players`, `Health`
3. Copia cada endpoint de este documento

### Opción 2: Variables de Entorno
Crea variables en Postman:
- `base_url` = `http://localhost:3000`
- `token` = (se actualizará después del login)

Luego usa:
```
{{base_url}}/api/auth/login
Authorization: Bearer {{token}}
```

---

**Fecha de creación:** 27 de octubre de 2025  
**Total de jugadores en BD:** 342,944 (161,583 ♂️ + 181,361 ♀️)
