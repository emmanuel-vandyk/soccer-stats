-- =====================================================
-- Custom Player Seed
-- Este archivo agrega un jugador personalizado (Emma Van Dick)
-- que estará disponible cuando alguien clone y ejecute la app
-- =====================================================

-- Primero, aseguramos que exista un usuario admin por defecto
-- (Si ya existe, no hace nada por el IGNORE)
INSERT IGNORE INTO `User` (id, username, email, password, role, created_at, updated_at)
VALUES (
  1,
  'admin',
  'admin@soccerstats.com',
  '$2b$10$abcdefghijklmnopqrstuv', -- Contraseña por defecto (deberías cambiarla)
  'admin',
  NOW(),
  NOW()
);

-- Aseguramos que exista la nacionalidad Argentina
-- (Si ya existe, no hace nada por el IGNORE)
INSERT IGNORE INTO `Nationality` (id, external_nationality_id, name, createdAt, updatedAt)
VALUES (
  999,
  999,
  'Argentina',
  NOW(),
  NOW()
);

-- Insertamos el jugador personalizado en la tabla Player
-- Este es el modelo de la aplicación, no de FIFA
INSERT IGNORE INTO `Player` (
  id,
  external_player_id,
  short_name,
  long_name,
  user_id,
  nationality_id,
  player_url,
  dob,
  player_face_url,
  created_at,
  updated_at
) VALUES (
  999999, -- ID único que no colisione con otros
  999999, -- external_player_id único
  'Emma Van Dick',
  'Emmanuel Van Dick',
  1, -- usuario admin
  999, -- Argentina (del INSERT anterior)
  'https://avatars.githubusercontent.com/emmanuelvandyk', -- URL personalizable
  '1998-08-28', -- Fecha de nacimiento personalizable
  'https://avatars.githubusercontent.com/emmanuelvandyk?s=120', -- Avatar personalizable
  NOW(),
  NOW()
);

-- PRIMERO: Insertamos stats de habilidad del jugador en SkillStats
-- (Debe ir antes de PlayerVersion porque PlayerVersion referencia a skill_set_id)
INSERT IGNORE INTO `SkillStats` (
  id,
  pace,
  shooting,
  passing,
  dribbling,
  defending,
  physic,
  attacking_crossing,
  attacking_finishing,
  attacking_heading_accuracy,
  attacking_short_passing,
  attacking_volleys,
  skill_dribbling,
  skill_curve,
  skill_fk_accuracy,
  skill_long_passing,
  skill_ball_control,
  movement_acceleration,
  movement_sprint_speed,
  movement_agility,
  movement_reactions,
  movement_balance,
  power_shot_power,
  power_jumping,
  power_stamina,
  power_strength,
  power_long_shots,
  mentality_aggression,
  mentality_interceptions,
  mentality_positioning,
  mentality_vision,
  mentality_penalties,
  mentality_composure,
  defending_marking_awareness,
  defending_standing_tackle,
  defending_sliding_tackle,
  goalkeeping_diving,
  goalkeeping_handling,
  goalkeeping_kicking,
  goalkeeping_positioning,
  goalkeeping_reflexes,
  goalkeeping_speed
) VALUES (
  999999, -- ID único
  -- Face Stats (principales)
  88, -- pace - personalizable
  82, -- shooting - personalizable
  85, -- passing - personalizable
  86, -- dribbling - personalizable
  45, -- defending - personalizable
  75, -- physic - personalizable
  
  -- Attacking
  83, -- crossing
  80, -- finishing
  65, -- heading accuracy
  87, -- short passing
  78, -- volleys
  
  -- Skill
  88, -- dribbling
  85, -- curve
  80, -- fk accuracy
  84, -- long passing
  89, -- ball control
  
  -- Movement
  90, -- acceleration
  86, -- sprint speed
  88, -- agility
  85, -- reactions
  87, -- balance
  
  -- Power
  82, -- shot power
  70, -- jumping
  80, -- stamina
  72, -- strength
  83, -- long shots
  
  -- Mentality
  60, -- aggression
  50, -- interceptions
  85, -- positioning
  88, -- vision
  80, -- penalties
  86, -- composure
  
  -- Defending
  40, -- marking awareness
  38, -- standing tackle
  35, -- sliding tackle
  
  -- Goalkeeping (bajas porque es jugador de campo)
  15, -- diving
  12, -- handling
  30, -- kicking
  10, -- positioning
  10, -- reflexes
  50 -- speed
);

-- SEGUNDO: Insertamos una versión del jugador en PlayerVersion
-- Aquí defines las stats del jugador
INSERT IGNORE INTO `PlayerVersion` (
  id,
  player_id,
  skill_set_id,
  fifa_version,
  fifa_update,
  overall,
  potential,
  value_eur,
  wage_eur,
  age,
  height_cm,
  weight_kg,
  preferred_foot,
  weak_foot,
  skill_moves,
  international_reputation,
  work_rate,
  body_type,
  player_positions,
  release_clause_eur,
  created_at,
  updated_at
) VALUES (
  999999, -- ID único
  999999, -- Referencia al Player
  999999, -- skill_set_id (referencia a SkillStats)
  23, -- FIFA 23
  1, -- Update 1
  85, -- Overall rating - personalizable
  90, -- Potential - personalizable
  50000000, -- Value en EUR - personalizable
  150000, -- Wage semanal en EUR - personalizable
  28, -- Edad - personalizable
  175, -- Altura en cm - personalizable
  70, -- Peso en kg - personalizable
  'Left', -- Pie preferido - personalizable
  4, -- Weak foot (1-5) - personalizable
  4, -- Skill moves (1-5) - personalizable
  3, -- International reputation (1-5) - personalizable
  'High/High', -- Work rate - personalizable
  'Normal (170-185)', -- Body type - personalizable
  'CAM, CM', -- Posiciones - personalizable
  NULL, -- Release clause
  NOW(),
  NOW()
);

-- TERCERO: Insertamos la posición principal del jugador
-- Primero nos aseguramos que existe la posición
INSERT IGNORE INTO `Position` (id, code, name, position_type, createdAt, updatedAt)
VALUES (999, 'CAM', 'Attacking Midfielder', 'Midfielder', NOW(), NOW());

-- Ahora la vinculamos con el jugador
INSERT IGNORE INTO `PlayerVersionPosition` (
  player_version_id,
  position_id,
  is_primary,
  createdAt,
  updatedAt
) VALUES (
  999999, -- PlayerVersion
  999, -- CAM position
  1, -- Es posición primaria
  NOW(),
  NOW()
);

-- Opcional: También puedes insertar el jugador en la tabla de FIFA players
-- si quieres que aparezca en las búsquedas generales
INSERT IGNORE INTO `players` (
  id,
  fifa_version,
  fifa_update,
  gender,
  player_face_url,
  long_name,
  short_name,
  player_positions,
  club_name,
  nationality_name,
  overall,
  potential,
  value_eur,
  wage_eur,
  age,
  height_cm,
  weight_kg,
  preferred_foot,
  weak_foot,
  skill_moves,
  international_reputation,
  work_rate,
  body_type,
  pace,
  shooting,
  passing,
  dribbling,
  defending,
  physic,
  player_traits
) VALUES (
  999999, -- ID único
  '23', -- FIFA version
  '1', -- Update
  'M', -- Gender (M o F) - personalizable
  'https://avatars.githubusercontent.com/u/93367648?v=4', -- Face URL
  'Emmanuel Van Dick', -- Long name
  'E. Van Dick', -- Short name
  'CAM, CM', -- Posiciones - personalizable
  'Talleres Cordoba', -- Club name - personalizable
  'Argentina', -- Nationality
  85, -- Overall
  90, -- Potential
  50000000, -- Value
  150000, -- Wage
  28, -- Age
  175, -- Height
  70, -- Weight
  'Left', -- Preferred foot
  4, -- Weak foot
  4, -- Skill moves
  3, -- International reputation
  'High/High', -- Work rate
  'Normal (170-185)', -- Body type
  88, -- Pace
  82, -- Shooting
  85, -- Passing
  86, -- Dribbling
  45, -- Defending
  75, -- Physic
  'Technical Dribbler, Playmaker, Long Shot Taker' -- Traits - personalizable
);
