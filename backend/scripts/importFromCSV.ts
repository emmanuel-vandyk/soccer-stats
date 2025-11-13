import mysql from 'mysql2/promise';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

interface CSVRow {
  player_id: string;
  player_url: string;
  fifa_version: string;
  fifa_update: string;
  fifa_update_date: string;
  short_name: string;
  long_name: string;
  player_positions: string;
  overall: string;
  potential: string;
  value_eur: string;
  wage_eur: string;
  age: string;
  dob: string;
  height_cm: string;
  weight_kg: string;
  league_id: string;
  league_name: string;
  league_level: string;
  club_team_id: string;
  club_name: string;
  club_position: string;
  club_jersey_number: string;
  club_loaned_from: string;
  club_joined_date: string;
  club_contract_valid_until_year: string;
  nationality_id: string;
  nationality_name: string;
  nation_team_id: string;
  nation_position: string;
  nation_jersey_number: string;
  preferred_foot: string;
  weak_foot: string;
  skill_moves: string;
  international_reputation: string;
  work_rate: string;
  body_type: string;
  real_face: string;
  release_clause_eur: string;
  player_tags: string;
  player_traits: string;
  pace: string;
  shooting: string;
  passing: string;
  dribbling: string;
  defending: string;
  physic: string;
  attacking_crossing: string;
  attacking_finishing: string;
  attacking_heading_accuracy: string;
  attacking_short_passing: string;
  attacking_volleys: string;
  skill_dribbling: string;
  skill_curve: string;
  skill_fk_accuracy: string;
  skill_long_passing: string;
  skill_ball_control: string;
  movement_acceleration: string;
  movement_sprint_speed: string;
  movement_agility: string;
  movement_reactions: string;
  movement_balance: string;
  power_shot_power: string;
  power_jumping: string;
  power_stamina: string;
  power_strength: string;
  power_long_shots: string;
  mentality_aggression: string;
  mentality_interceptions: string;
  mentality_positioning: string;
  mentality_vision: string;
  mentality_penalties: string;
  mentality_composure: string;
  defending_marking_awareness: string;
  defending_standing_tackle: string;
  defending_sliding_tackle: string;
  goalkeeping_diving: string;
  goalkeeping_handling: string;
  goalkeeping_kicking: string;
  goalkeeping_positioning: string;
  goalkeeping_reflexes: string;
  goalkeeping_speed: string;
  ls: string;
  st: string;
  rs: string;
  lw: string;
  lf: string;
  cf: string;
  rf: string;
  rw: string;
  lam: string;
  cam: string;
  ram: string;
  lm: string;
  lcm: string;
  cm: string;
  rcm: string;
  rm: string;
  lwb: string;
  ldm: string;
  cdm: string;
  rdm: string;
  rwb: string;
  lb: string;
  lcb: string;
  cb: string;
  rcb: string;
  rb: string;
  gk: string;
  player_face_url: string;
}

async function createTable(connection: mysql.Connection): Promise<void> {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS players (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      fifa_version VARCHAR(255) NOT NULL COMMENT 'FIFA version (16, 17, 18, etc.)',
      fifa_update VARCHAR(255) NOT NULL COMMENT 'Update number within the FIFA version',
      gender ENUM('M', 'F') NOT NULL COMMENT 'Player gender: M = Male, F = Female',
      player_face_url VARCHAR(255) NOT NULL,
      long_name VARCHAR(255) NOT NULL,
      short_name VARCHAR(255) NOT NULL,
      player_positions VARCHAR(255) NOT NULL COMMENT 'Comma-separated list of positions (e.g., "ST, CF")',
      club_name VARCHAR(255) NULL,
      nationality_name VARCHAR(255) NULL,
      overall INT NOT NULL COMMENT 'Overall rating (1-99)',
      potential INT NOT NULL COMMENT 'Potential rating (1-99)',
      value_eur INT NULL COMMENT 'Market value in EUR',
      wage_eur INT NULL COMMENT 'Weekly wage in EUR',
      age INT NOT NULL,
      height_cm INT NULL,
      weight_kg INT NULL,
      preferred_foot VARCHAR(255) NULL,
      weak_foot INT NULL COMMENT '1-5 stars',
      skill_moves INT NULL COMMENT '1-5 stars',
      international_reputation INT NULL COMMENT '1-5 stars',
      work_rate VARCHAR(255) NULL COMMENT 'e.g., "High/Medium"',
      body_type VARCHAR(255) NULL,
      pace INT NULL,
      shooting INT NULL,
      passing INT NULL,
      dribbling INT NULL,
      defending INT NULL,
      physic INT NULL,
      attacking_crossing INT NULL,
      attacking_finishing INT NULL,
      attacking_heading_accuracy INT NULL,
      attacking_short_passing INT NULL,
      attacking_volleys INT NULL,
      skill_dribbling INT NULL,
      skill_curve INT NULL,
      skill_fk_accuracy INT NULL,
      skill_long_passing INT NULL,
      skill_ball_control INT NULL,
      movement_acceleration INT NULL,
      movement_sprint_speed INT NULL,
      movement_agility INT NULL,
      movement_reactions INT NULL,
      movement_balance INT NULL,
      power_shot_power INT NULL,
      power_jumping INT NULL,
      power_stamina INT NULL,
      power_strength INT NULL,
      power_long_shots INT NULL,
      mentality_aggression INT NULL,
      mentality_interceptions INT NULL,
      mentality_positioning INT NULL,
      mentality_vision INT NULL,
      mentality_penalties INT NULL,
      mentality_composure INT NULL,
      defending_marking INT NULL,
      defending_standing_tackle INT NULL,
      defending_sliding_tackle INT NULL,
      goalkeeping_diving INT NULL,
      goalkeeping_handling INT NULL,
      goalkeeping_kicking INT NULL,
      goalkeeping_positioning INT NULL,
      goalkeeping_reflexes INT NULL,
      goalkeeping_speed INT NULL,
      player_traits VARCHAR(255) NULL COMMENT 'Comma-separated list of player traits',
      
      INDEX idx_fifa_version_update (fifa_version, fifa_update),
      INDEX idx_gender (gender),
      INDEX idx_long_name (long_name),
      INDEX idx_short_name (short_name),
      INDEX idx_nationality (nationality_name),
      INDEX idx_club (club_name),
      INDEX idx_overall (overall),
      INDEX idx_positions (player_positions)
    );
  `;

  await connection.query(createTableSQL);
  console.log('✅ Tabla players creada/verificada');
}

function convertValue(value: string, type: 'int' | 'string'): any {
  if (!value || value.trim() === '' || value.toLowerCase() === 'null') {
    return null;
  }
  
  if (type === 'int') {
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  }
  
  return value.trim().replace(/'/g, "\\'"); // Escapar comillas simples
}

async function importCSVFile(filePath: string, gender: 'M' | 'F', connection: mysql.Connection): Promise<number> {
  return new Promise((resolve, reject) => {
    const records: any[] = [];
    let processed = 0;
    
    console.log(`📂 Procesando ${path.basename(filePath)}...`);
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: CSVRow) => {
        // Convertir y mapear los datos del CSV a la estructura de la base de datos
        const record = {
          fifa_version: convertValue(row.fifa_version, 'string'),
          fifa_update: convertValue(row.fifa_update, 'string'),
          gender: gender,
          player_face_url: convertValue(row.player_face_url, 'string') || '',
          long_name: convertValue(row.long_name, 'string'),
          short_name: convertValue(row.short_name, 'string'),
          player_positions: convertValue(row.player_positions, 'string'),
          club_name: convertValue(row.club_name, 'string'),
          nationality_name: convertValue(row.nationality_name, 'string'),
          overall: convertValue(row.overall, 'int'),
          potential: convertValue(row.potential, 'int'),
          value_eur: convertValue(row.value_eur, 'int'),
          wage_eur: convertValue(row.wage_eur, 'int'),
          age: convertValue(row.age, 'int'),
          height_cm: convertValue(row.height_cm, 'int'),
          weight_kg: convertValue(row.weight_kg, 'int'),
          preferred_foot: convertValue(row.preferred_foot, 'string'),
          weak_foot: convertValue(row.weak_foot, 'int'),
          skill_moves: convertValue(row.skill_moves, 'int'),
          international_reputation: convertValue(row.international_reputation, 'int'),
          work_rate: convertValue(row.work_rate, 'string'),
          body_type: convertValue(row.body_type, 'string'),
          pace: convertValue(row.pace, 'int'),
          shooting: convertValue(row.shooting, 'int'),
          passing: convertValue(row.passing, 'int'),
          dribbling: convertValue(row.dribbling, 'int'),
          defending: convertValue(row.defending, 'int'),
          physic: convertValue(row.physic, 'int'),
          attacking_crossing: convertValue(row.attacking_crossing, 'int'),
          attacking_finishing: convertValue(row.attacking_finishing, 'int'),
          attacking_heading_accuracy: convertValue(row.attacking_heading_accuracy, 'int'),
          attacking_short_passing: convertValue(row.attacking_short_passing, 'int'),
          attacking_volleys: convertValue(row.attacking_volleys, 'int'),
          skill_dribbling: convertValue(row.skill_dribbling, 'int'),
          skill_curve: convertValue(row.skill_curve, 'int'),
          skill_fk_accuracy: convertValue(row.skill_fk_accuracy, 'int'),
          skill_long_passing: convertValue(row.skill_long_passing, 'int'),
          skill_ball_control: convertValue(row.skill_ball_control, 'int'),
          movement_acceleration: convertValue(row.movement_acceleration, 'int'),
          movement_sprint_speed: convertValue(row.movement_sprint_speed, 'int'),
          movement_agility: convertValue(row.movement_agility, 'int'),
          movement_reactions: convertValue(row.movement_reactions, 'int'),
          movement_balance: convertValue(row.movement_balance, 'int'),
          power_shot_power: convertValue(row.power_shot_power, 'int'),
          power_jumping: convertValue(row.power_jumping, 'int'),
          power_stamina: convertValue(row.power_stamina, 'int'),
          power_strength: convertValue(row.power_strength, 'int'),
          power_long_shots: convertValue(row.power_long_shots, 'int'),
          mentality_aggression: convertValue(row.mentality_aggression, 'int'),
          mentality_interceptions: convertValue(row.mentality_interceptions, 'int'),
          mentality_positioning: convertValue(row.mentality_positioning, 'int'),
          mentality_vision: convertValue(row.mentality_vision, 'int'),
          mentality_penalties: convertValue(row.mentality_penalties, 'int'),
          mentality_composure: convertValue(row.mentality_composure, 'int'),
          defending_marking: convertValue(row.defending_marking_awareness, 'int'), // Note: CSV has 'defending_marking_awareness'
          defending_standing_tackle: convertValue(row.defending_standing_tackle, 'int'),
          defending_sliding_tackle: convertValue(row.defending_sliding_tackle, 'int'),
          goalkeeping_diving: convertValue(row.goalkeeping_diving, 'int'),
          goalkeeping_handling: convertValue(row.goalkeeping_handling, 'int'),
          goalkeeping_kicking: convertValue(row.goalkeeping_kicking, 'int'),
          goalkeeping_positioning: convertValue(row.goalkeeping_positioning, 'int'),
          goalkeeping_reflexes: convertValue(row.goalkeeping_reflexes, 'int'),
          goalkeeping_speed: convertValue(row.goalkeeping_speed, 'int'),
          player_traits: convertValue(row.player_traits, 'string')
        };
        
        records.push(record);
        processed++;
        
        if (processed % 10000 === 0) {
          console.log(`   📊 Procesados ${processed} registros...`);
        }
      })
      .on('end', async () => {
        try {
          console.log(`   📋 Total registros a insertar: ${records.length}`);
          
          // Insertar en lotes de 1000 registros
          const batchSize = 1000;
          let inserted = 0;
          
          for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            
            // Construir el INSERT SQL
            const columns = Object.keys(batch[0]);
            const placeholders = batch.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');
            const sql = `INSERT INTO players (${columns.join(', ')}) VALUES ${placeholders}`;
            
            // Preparar los valores
            const values = batch.flatMap(record => columns.map(col => record[col]));
            
            await connection.query(sql, values);
            inserted += batch.length;
            
            console.log(`   💾 Insertados ${inserted}/${records.length} registros (${Math.round((inserted/records.length)*100)}%)`);
          }
          
          console.log(`✅ ${inserted} jugadores ${gender === 'M' ? 'masculinos' : 'femeninos'} importados\n`);
          resolve(inserted);
          
        } catch (error) {
          console.error(`❌ Error insertando datos:`, (error as Error).message);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error(`❌ Error leyendo CSV:`, error.message);
        reject(error);
      });
  });
}

async function main() {
  let connection;
  
  try {
    // Conectar a la base de datos
    console.log('🔌 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión establecida\n');
    
    // Crear/verificar la tabla
    await createTable(connection);
    
    // Limpiar tabla existente
    console.log('🧹 Limpiando tabla existente...');
    await connection.query('TRUNCATE TABLE players');
    console.log('✅ Tabla limpiada\n');
    
    // Importar archivos CSV
    const baseDir = '/home/emmavandick/Escritorio/Portfolio/soccer-stats/backend/scripts/dump-data';
    const files = [
      { path: path.join(baseDir, 'male_players.csv'), gender: 'M' as 'M' },
      { path: path.join(baseDir, 'female_players.csv'), gender: 'F' as 'F' }
    ];
    
    let totalImported = 0;
    
    for (const file of files) {
      console.log(`🚀 Importando ${file.gender === 'M' ? 'jugadores masculinos' : 'jugadoras femeninas'}...`);
      const imported = await importCSVFile(file.path, file.gender, connection);
      totalImported += imported;
    }
    
    // Verificar resultados
    const [result] = await connection.query('SELECT COUNT(*) as total FROM players');
    const total = (result as any)[0].total;
    
    console.log(`🎉 IMPORTACIÓN COMPLETADA:`);
    console.log(`   📊 Total de registros: ${total}`);
    console.log(`   ✅ Importados: ${totalImported}`);
    
    // Verificar short_name
    const [shortNameTest] = await connection.query(
      'SELECT short_name, long_name FROM players WHERE short_name IS NOT NULL LIMIT 5'
    );
    console.log(`\n🔍 Verificación de short_name (primeros 5 registros):`);
    console.table(shortNameTest);
    
  } catch (error) {
    console.error('❌ Error durante la importación:', (error as Error).message);
    console.error((error as Error).stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

main();