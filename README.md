<div align="center">

[![Angular](https://img.shields.io/badge/Angular-20.3-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.5-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)](https://www.chartjs.org/)
[![Bun](https://img.shields.io/badge/Bun-1.0-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

![Soccer Stats Logo](./frontend/public/soccer-stats-logo.png)

**Aplicación web moderna para visualizar y gestionar estadísticas de jugadores de fútbol.**

[Inicio Rápido](#-inicio-rápido) • [Docker](#-docker) • [Características](#-características) • [API](#-endpoints-del-backend) • [DEMO](#-video-demostracion)

</div>

---

## 🚀 Inicio Rápido

### 📋 Requisitos Previos

- Node.js 20.x o superior
- Bun (recomendado) o npm
- Backend corriendo ([Ver repositorio del backend](https://github.com/emmanuel-vandyk/soccer-stats/tree/main/backend))

### ⚙️ Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/emmanuel-vandyk/soccer-stats.git
cd soccer-stats/frontend

# 2. Instalar dependencias
bun install  # o npm install

# 3. Iniciar desarrollo según tu backend
bun run docker         # Backend en Docker (ng serve puerto 4000)
bun run start   # Backend en Localhost (ng serve puerto 4200)
```

**Scripts de desarrollo:**

| Comando | Backend | Backend Puerto | Frontend Puerto | Uso |
|---------|---------|----------------|-----------------|-----|
| `bun run docker` | Docker | 3000 | 4200 | Desarrollo local → Backend Docker |
| `bun run start` | Localhost | 3000 | 4200 | Desarrollo local → Backend Localhost |

**Acceder a la aplicación:**
- Frontend desarrollo: `http://localhost:4200`

## 👤 Usuarios de Prueba

| Campo | Valor |
|-------|-------|
| **Email** | `demo@example.com` |
| **Password** | `Demo123456` |

---

## 🐳 Docker

### Modo 1: Full Docker (Producción)

Backend + Frontend en Docker con SSR:

```bash
# 1. Levantar backend en Docker (puerto 3000)
cd ../backend && docker compose up -d

# 2. Levantar frontend en Docker (SSR con Bun puerto 4000)
cd ../frontend && bun run docker
```

**Acceder:**
- Frontend: `http://localhost:4000`
- Backend: `http://localhost:3000`

---

### Modo 2: Desarrollo Localhost (Recomendado)

Backend + Frontend en localhost:

```bash
# 1. Levantar solo MySQL y Redis
cd ../backend && docker compose up -d mysql redis

# 2. Backend en localhost (puerto 3000)
cd ../backend && bun run start

# 3. Frontend en localhost (puerto 4200) 
cd ../frontend && bun run start
```

**Acceder:**
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/              # Servicios, guards, interceptors, modelos
│   ├── features/          # Módulos de funcionalidades
│   │   ├── auth/          # Autenticación (login, register)
│   │   ├── home/          # Página principal
│   │   └── players/       # Gestión de jugadores
│   └── shared/            # Componentes, pipes y directivas compartidas
├── config/
│   └── environment.ts     # Configuración de variables de entorno
└── styles.css             # Estilos globales
```

---

## 🔧 Configuración

### Archivos de Configuración

El proyecto usa archivos TypeScript para configuración en lugar de `.env`:

| Archivo | Backend | Puerto | Uso |
|---------|---------|--------|-----|
| `src/config/environment.docker.ts` | Docker | 3000 | `bun run start` |
| `src/config/environment.localhost.ts` | Localhost | 3000 | `bun run start:local` |
| `src/config/environment.ts` | Docker (default) | 3000 | Usado por Angular |
---

**CORS:**
El backend ya está configurado para aceptar requests de:
- `http://localhost:4200` (Frontend desarrollo)
- `http://localhost:4000` (Frontend Docker)


---

## ✨ Características

- 🔐 Sistema de autenticación con JWT
- ⚽ CRUD completo de jugadores FIFA
- 🔍 Búsqueda y filtros avanzados
- 📊 Gráficos interactivos con Chart.js
- 📤 Exportación de datos (CSV/Excel)
- 🚀 Performance optimizado con caché inteligente
- � Diseño responsive mobile-first

---

## 🛠️ Stack Tecnológico

- Angular 20.3 (Standalone Components)
- TypeScript 5.9
- Chart.js 4.5 + ng2-charts
- Angular Signals
- Bun (runtime y package manager)
- CSS Nativo + View Transitions API

---
- Estadísticas detalladas por jugador
- Top jugadores por rating
- Evolución histórica de estadísticas (FIFA 15-23)

### 🚀 Performance y UX
- Diseño responsive mobile-first
- Caché inteligente de datos
- Prefetch de recursos
- Lazy loading de módulos
- View Transitions API para navegación fluida
- Optimización de imágenes

### 🔧 Environments

| Environment | Backend URL | Uso |
|-------------|-------------|-----|
| `environment.ts` | `http://localhost:3000/api` | Docker (por defecto) |
| `environment.local.ts` | `http://localhost:3000/api` | Localhost |
| `environment.prod.ts` | `http://localhost:3000/api` | Producción |

## 🌐 Endpoints del Backend

### Autenticación (Públicos)
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Jugadores FIFA (🔒 Requiere autenticación)
- `GET /api/fifa-players` - Lista con filtros y paginación
- `GET /api/fifa-players/search` - Búsqueda por nombre
- `GET /api/fifa-players/top-rated` - Top jugadores
- `GET /api/fifa-players/:id` - Detalle de jugador
- `POST /api/players` - Crear jugador
- `PUT /api/players/:id` - Actualizar jugador
- `DELETE /api/players/:id` - Eliminar jugador
- `GET /api/players/export` - Exportar datos (CSV/Excel)

---

## 📹 Demo de Soccer Stats
[👉 CLICK AQUÍ](https://drive.google.com/file/d/1pxpnHEgrewLyktgwBqqLeimVv6TrVnV1/view?usp=drive_link)


## 📄 Licencia

Este proyecto está bajo la [Licencia MIT](https://opensource.org/licenses/MIT).

---

<div align="center">

**X Academy - Proyecto Fase 1**

**Creado por: Emmanuel Van Dick**

**⚽ Hecho con pasión por el fútbol y el desarrollo web**

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>
