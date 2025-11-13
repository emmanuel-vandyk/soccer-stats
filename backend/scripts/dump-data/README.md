# Database Seed Files

Este directorio contiene los archivos SQL para inicializar la base de datos.

## 📦 Descarga de Archivos Grandes

Debido a las limitaciones de tamaño de GitHub, los archivos de dump completos están alojados externamente:

**[📥 Descargar Archivos de Dump](https://drive.google.com/drive/folders/1BC1jlrvWbwZcXTbhelWhXF9UI7bpjCQa?usp=sharing)**

Archivos necesarios (colocar en este directorio):
- `01-fifa_male_players.sql` (52 MB) - Jugadores masculinos de FIFA
- `02-fifa_female_players.sql` (54 MB) - Jugadoras femeninas de FIFA
- `male_players.csv` (86.72 MB) - CSV de jugadores masculinos
- `female_players.csv` (89.85 MB) - CSV de jugadoras femeninas

### Instalación

1. Descarga los archivos del link de arriba
2. Colócalos en `backend/scripts/dump-data/`
3. Ejecuta Docker Compose normalmente

```bash
docker compose up -d
```

Los seeds se cargarán automáticamente en el orden correcto.

---

## Archivos

### 1. `01-fifa_male_players.sql` (53MB) 🔽
Contiene todos los jugadores masculinos de FIFA del dump original.
**Requiere descarga externa** - Ver link arriba.

### 2. `02-fifa_female_players.sql` (55MB) 🔽
Contiene todas las jugadoras femeninas de FIFA del dump original.
**Requiere descarga externa** - Ver link arriba.

### 3. `03-custom-player-seed.sql` ⭐ INCLUIDO
**Jugador personalizado que se carga automáticamente**

Este archivo contiene un jugador personalizado (Emma Van Dick) que se incluye automáticamente cuando alguien clona y ejecuta la aplicación por primera vez.

## 🎮 Personalizar el Jugador

Puedes editar `03-custom-player-seed.sql` para cambiar:

### Información Básica
```sql
short_name: 'Emma Van Dick'          -- Nombre corto
long_name: 'Emma Vandick'            -- Nombre completo
dob: '1998-08-28'                    -- Fecha de nacimiento
player_face_url: 'https://public/images/emma-player.webp'       -- URL de la foto
club_name: 'Portfolio FC'            -- Club
nationality_name: 'Argentina'        -- Nacionalidad
```

### Atributos del Jugador
```sql
overall: 85                          -- Rating general (1-99)
potential: 90                        -- Potencial máximo (1-99)
age: 28                              -- Edad
height_cm: 175                       -- Altura en cm
weight_kg: 70                        -- Peso en kg
preferred_foot: 'Right'              -- Pie preferido (Right/Left)
weak_foot: 4                         -- Pie débil (1-5 estrellas)
skill_moves: 4                       -- Habilidad (1-5 estrellas)
```

### Stats Principales (Face Stats)
```sql
pace: 88         -- Velocidad
shooting: 82     -- Tiro
passing: 85      -- Pase
dribbling: 86    -- Regate
defending: 45    -- Defensa
physic: 75       -- Físico
```

### Posiciones
Por defecto es **CAM** (Attacking Midfielder). Para cambiar:

```sql
player_positions: 'CAM, CM'          -- Puedes usar: ST, CF, CAM, CM, CDM, etc.
```

### Trabajo y Estilo
```sql
work_rate: 'High/High'               -- Work rate (High/Medium/Low para Ataque/Defensa)
body_type: 'Normal (170-185)'        -- Tipo de cuerpo
player_traits: 'Technical Dribbler, Playmaker, Long Shot Taker'  -- Rasgos especiales
```

### Valores Económicos
```sql
value_eur: 50000000                  -- Valor de mercado (€50M)
wage_eur: 150000                     -- Salario semanal (€150k)
```

## 🔄 Aplicar Cambios

### Si ya ejecutaste Docker anteriormente:

```bash
# 1. Detener y eliminar el contenedor actual
docker compose down

# 2. Eliminar el volumen de MySQL (esto borrará TODA la DB)
docker volume rm soccer_stats_mysql_data

# 3. Iniciar de nuevo (se ejecutarán todos los seeds)
docker compose up -d
```

### Si es la primera vez:

```bash
# Solo ejecuta
docker compose up -d
```

El seed se ejecutará automáticamente y tu jugador estará disponible con ID: **999999**

## 🔍 Verificar que el Jugador fue Creado

```bash
# Conectar a MySQL
docker exec -it soccer_stats_db mysql -u emmavd -p

# En MySQL:
USE soccers_stats;

# Ver el jugador en la tabla Player
SELECT * FROM Player WHERE id = 999999;

# Ver la versión del jugador con stats
SELECT * FROM PlayerVersion WHERE id = 999999;

# Ver el jugador en la tabla de FIFA players
SELECT id, long_name, short_name, overall, potential, club_name 
FROM players 
WHERE id = 999999;
```

## 📝 Notas Importantes

1. **ID Único**: El jugador usa el ID `999999` para evitar conflictos con los datos de FIFA
2. **Usuario Admin**: El seed crea un usuario admin por defecto (user_id = 1)
3. **Nacionalidad**: Si quieres otra nacionalidad, asegúrate de que exista en la tabla `Nationality`
4. **Persistencia**: Los volúmenes de Docker (`mysql_data`) mantienen los datos incluso si apagas los contenedores
5. **IGNORE**: Todas las inserciones usan `INSERT IGNORE` para que no fallen si ya existen los datos
6. **Archivos Grandes**: Los archivos SQL y CSV grandes NO están en el repositorio - deben descargarse del link externo

## 🎯 Ejemplo de Uso en la API

Una vez cargado, puedes buscar el jugador:

```bash
# Por ID
GET http://localhost:3000/api/players/999999

# Por nombre
GET http://localhost:3000/api/players/search?name=Emma
```