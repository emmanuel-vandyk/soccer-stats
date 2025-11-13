# 🎮 Jugador Personalizado - Guía Completa

## ✅ ¿Qué se ha configurado?

Tu aplicación ahora incluye **automáticamente** un jugador personalizado que se carga cuando alguien ejecuta Docker por primera vez.

### Archivos creados/modificados:

1. **`scripts/dump-data/03-custom-player-seed.sql`** ⭐  
   - Archivo SQL que inserta el jugador personalizado
   - Se ejecuta automáticamente al iniciar Docker
   - Incluye: Player, PlayerVersion, SkillStats, Position y entrada en FIFA players

2. **`scripts/dump-data/README.md`**  
   - Documentación detallada sobre cómo personalizar el jugador
   - Instrucciones para modificar stats, posiciones, etc.

3. **`scripts/checkCustomPlayer.ts`**  
   - Script TypeScript para verificar que el jugador se cargó correctamente
   - Muestra todos los datos del jugador en consola

4. **`docker-compose.yml`** (actualizado)  
   - Ahora monta el nuevo seed file `03-custom-player-seed.sql`
   - Se ejecuta después de los datos de FIFA

5. **`package.json`** (actualizado)  
   - Agregado comando: `npm run check-custom-player`

## 🚀 ¿Cómo funciona?

### Primera vez (nuevo usuario):
```bash
git clone tu-repo
cd backend

# 1. Levantar Docker (carga jugadores de FIFA)
docker compose up -d

# 2. Cargar jugador personalizado (opcional)
./scripts/seedCustomPlayer.sh
```

El script `seedCustomPlayer.sh`:
- ✅ Verifica que MySQL esté listo
- ✅ Ejecuta el seed SQL
- ✅ Muestra verificación de datos
- ✅ NO borra datos existentes

### Datos del jugador por defecto:

- **ID**: 999999 (único, no colisiona con FIFA)
- **Nombre**: Emma Van Dick / Emma Vandick
- **Club**: Portfolio FC
- **Nacionalidad**: Argentina
- **Posición**: CAM (Attacking Midfielder)
- **Overall**: 85
- **Potential**: 90
- **Edad**: 27
- **Género**: M (Male)

## 🎯 Verificar que se cargó correctamente

```bash
# Opción 1: Script TypeScript
npm run check-custom-player

# Opción 2: Directamente con ts-node
ts-node scripts/checkCustomPlayer.ts

# Opción 3: MySQL directo
docker exec -it soccer_stats_db mysql -u emmavd -p
# Password: vangelis_genesis
USE soccers_stats;
SELECT * FROM Player WHERE id = 999999;
SELECT * FROM players WHERE id = 999999;
```

## ✏️ Para Personalizar

```bash
# 1. Editar el seed
nano scripts/dump-data/03-custom-player-seed.sql

# 2. Ejecutar de nuevo (actualiza el jugador)
./scripts/seedCustomPlayer.sh

# 3. Verificar
npm run check-custom-player
```

**Nota:** El seed usa `INSERT IGNORE` por lo que si el jugador ya existe, no hace nada. Para actualizarlo, primero bórralo:

```bash
docker exec soccer_stats_db mysql -u emmavd -pvangelis_genesis soccers_stats -e "DELETE FROM Player WHERE id = 999999; DELETE FROM players WHERE id = 999999;"
./scripts/seedCustomPlayer.sh
```

## 🔍 Acceder al jugador desde la API

Una vez cargado, puedes acceder al jugador:

```bash
# Ver jugador en tabla FIFA
GET http://localhost:3000/api/fifa-players/999999

# Buscar por nombre
GET http://localhost:3000/api/fifa-players/search?q=Emma

# Ver en tabla Player (requiere auth)
GET http://localhost:3000/api/players/999999

# Timeline de evolución
GET http://localhost:3000/api/players/999999/timeline
```

## 💡 Casos de uso

### 1. Demo para Portfolio
```
"Cuando alguien ejecuta mi app, ve mi jugador personalizado 
automáticamente cargado con mis stats preferidas"
```

### 2. Testing
```
"Tengo un jugador de prueba con ID fijo (999999) 
para usar en tests E2E"
```

### 3. Comparaciones
```
"Comparo mi jugador personalizado vs jugadores reales de FIFA"
```

## 📊 Estructura de tablas

El seed inserta datos en:

1. **`User`** - Usuario admin (id: 1)
2. **`Nationality`** - Nacionalidad Argentina (id: 1)  
3. **`Player`** - Jugador base (id: 999999)
4. **`PlayerVersion`** - Versión FIFA del jugador (id: 999999)
5. **`SkillStats`** - Stats detalladas (id: 999999)
6. **`Position`** - Posición CAM (id: 10)
7. **`PlayerVersionPosition`** - Relación jugador-posición
8. **`players`** - Tabla FIFA (opcional, para búsquedas)

## 🔐 Persistencia

### ¿Los datos persisten si apago Docker?

✅ **SÍ** - Los volúmenes de Docker mantienen los datos:
```bash
docker compose down    # Apaga contenedores pero mantiene datos
docker compose up -d   # Vuelve a iniciar con los mismos datos
```

### ¿Cómo empezar de cero?

```bash
docker compose down
docker volume rm soccer_stats_mysql_data  # Elimina TODOS los datos
docker compose up -d                      # Recrea todo desde cero
./scripts/seedCustomPlayer.sh             # Carga tu jugador personalizado
```

## 🎨 Posiciones disponibles

Puedes usar estas abreviaciones en `player_positions`:

**Atacantes:**
- ST (Striker)
- CF (Center Forward)
- LW (Left Winger)
- RW (Right Winger)

**Mediocampistas:**
- CAM (Central Attacking Midfielder) ⭐ Default
- CM (Central Midfielder)
- CDM (Central Defensive Midfielder)
- LM (Left Midfielder)
- RM (Right Midfielder)

**Defensores:**
- LB (Left Back)
- RB (Right Back)
- CB (Center Back)
- LWB (Left Wing Back)
- RWB (Right Wing Back)

**Portero:**
- GK (Goalkeeper)

## 🚨 Troubleshooting

### "No se encontró el jugador"
```bash
# Verificar que Docker terminó de cargar los datos
docker-compose logs mysql | tail -50

# Debe decir algo como:
# "MySQL init process done. Ready for start up."

# Reintentar verificación
npm run check-custom-player
```

### "Error: Cannot connect to database"
```bash
# Verificar que los servicios están corriendo
docker-compose ps

# Deberías ver:
# soccer_stats_db    running
# soccer_stats_api   running
# soccer_stats_redis running
```

### "El jugador aparece duplicado"
```bash
# El seed usa INSERT IGNORE, no debería pasar
# Pero si sucede:
docker exec -it soccer_stats_db mysql -u emmavd -p
DELETE FROM Player WHERE id = 999999;
DELETE FROM PlayerVersion WHERE id = 999999;
DELETE FROM players WHERE id = 999999;
# Luego reinicia Docker
```

## 📝 Agregar más jugadores personalizados

Puedes crear múltiples seeds:

```bash
# Copiar el template
cp scripts/dump-data/03-custom-player-seed.sql scripts/dump-data/04-another-player.sql

# Editar IDs (usar 999998, 999997, etc.)
# Editar docker-compose.yml:
volumes:
  - ./scripts/dump-data/04-another-player.sql:/docker-entrypoint-initdb.d/04-another-player.sql:ro
```

## ❓ Preguntas frecuentes

**P: ¿Puedo cambiar el ID 999999?**  
R: Sí, pero asegúrate de que no colisione con los IDs de FIFA (hasta ~342,000)

**P: ¿Se ejecuta cada vez que inicio Docker?**  
R: No, solo la primera vez o después de borrar el volumen

**P: ¿Afecta a los datos de FIFA?**  
R: No, usa IDs únicos que no interfieren

**P: ¿Puedo tener múltiples versiones FIFA del mismo jugador?**  
R: Sí, crea múltiples `PlayerVersion` con el mismo `player_id` pero diferentes `fifa_version`