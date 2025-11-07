/**
 * First model of FIFA player
 * Reflects the structure of the players table in the backend
 */
export interface FifaPlayer {
  // ID
  id: number;
  gender: 'M' | 'F';
  fifa_version: string;          // "15", "16", "17", etc.
  fifa_update: string;           // "1", "2", etc.

  // Basic info
  long_name: string;
  short_name?: string;
  player_positions: string;      // "RW, ST, CF"
  club_name: string;
  nationality_name: string;

  // Basic Stats
  overall: number;               // 1-99
  potential: number;             // 1-99
  age: number;
  value_eur: number;
  wage_eur: number;

  // Face Stats (6 main skills)
  pace: number;                  // 0-99
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physic: number;

  // Additional Info
  player_url?: string;
  player_face_url?: string;
  club_logo_url?: string;
  nation_flag_url?: string;

  // Physical
  height_cm?: number;
  weight_kg?: number;
  body_type?: string;

  // Abilities and skills
  preferred_foot?: 'Left' | 'Right';
  weak_foot?: number;            // 1-5
  skill_moves?: number;          // 1-5
  work_rate?: string;            // "High/Medium"

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Filtros para búsqueda de jugadores
 * NOTA: Los nombres están en camelCase, pero el ApiService
 * debe convertirlos a kebab-case para el backend
 */
export interface PlayerFilters {
  // Search & basic filters
  name?: string;
  clubName?: string;
  nationalityName?: string;
  position?: string;
  gender?: 'M' | 'F' | 'm' | 'f';

  // FIFA filters
  fifaVersion?: string;
  fifaUpdate?: string;

  // Numeric filters (ranges)
  overallMin?: number;
  overallMax?: number;
  potentialMin?: number;
  potentialMax?: number;
  ageMin?: number;
  ageMax?: number;

  // Order & pagination
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Complete backend response for radar-stats
 */
export interface PlayerRadarStatsResponse {
  playerInfo: {
    id: number;
    longName: string;
    shortName?: string;
    playerFaceUrl: string;
    overall: number;
    potential: number;
    age: number;
    position: string;
    club: string;
    fifaVersion: string;
  };
  radarChart: {
    labels: string[];
    values: number[];
  };
  detailedStats: {
    attacking: {
      crossing: number;
      finishing: number;
      headingAccuracy: number;
      shortPassing: number;
      volleys: number;
    };
    skill: {
      dribbling: number;
      curve: number;
      fkAccuracy: number;
      longPassing: number;
      ballControl: number;
    };
    movement: {
      acceleration: number;
      sprintSpeed: number;
      agility: number;
      reactions: number;
      balance: number;
    };
    power: {
      shotPower: number;
      jumping: number;
      stamina: number;
      strength: number;
      longShots: number;
    };
    mentality: {
      aggression: number;
      interceptions: number;
      positioning: number;
      vision: number;
      penalties: number;
      composure: number;
    };
    defending: {
      marking: number;
      standingTackle: number;
      slidingTackle: number;
    };
    goalkeeping: {
      diving: number;
      handling: number;
      kicking: number;
      positioning: number;
      reflexes: number;
      speed: number;
    };
  };
}

/**
 * Data for Chart.js Radar Chart (simplified format for component)
 */
export interface PlayerRadarStats {
  playerId: number;
  playerName: string;
  stats: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physic: number;
  };
}

/**
 * Timeline evolution of player by FIFA version
 */
export interface PlayerTimeline {
  playerId: number;
  playerName: string;
  timeline: PlayerVersionStats[];
}

export interface PlayerVersionStats {
  // Backend inconsistency: returns camelCase instead of snake_case
  fifaVersion?: string;        // Backend actual format (camelCase)
  fifa_version?: string;       // Expected format (snake_case)
  fifaUpdate?: string;         // Backend actual format (camelCase)
  fifa_update?: string;        // Expected format (snake_case)
  overall: number;
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defending?: number;
  physic?: number;
  // Cualquier otra skill específica
  [key: string]: string | number | undefined;
}

/**
 * DTO for player creation/edit forms
 */
export interface PlayerFormData {
  // Required fields
  long_name: string;
  short_name: string;
  player_positions: string;

  // Optional fields with default values
  fifa_version?: string;
  fifa_update?: string;
  gender?: 'M' | 'F';
  overall?: number;
  potential?: number;
  age?: number;

  // Club and identification
  club_name?: string;
  league_name?: string;
  nationality_name?: string;

  // Main skills
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defending?: number;
  physic?: number;

  // Physical and technical characteristics
  height_cm?: number;
  weight_kg?: number;
  preferred_foot?: 'Right' | 'Left';
  weak_foot?: number;
  skill_moves?: number;
  work_rate?: string;
  body_type?: string;

  // Financial
  value_eur?: number;
  wage_eur?: number;
  release_clause_eur?: number;
}
