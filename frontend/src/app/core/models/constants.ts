/**
 * Constants used across the application
 */

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  FILTERS: 'player_filters'
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100
} as const;

export const DEFAULT_SORT = {
  BY: 'overall',
  ORDER: 'DESC' as const
} as const;

export const FIFA_VERSIONS = [
  '15', '16', '17', '18', '19', '20', '21', '22', '23'
] as const;

export const PLAYER_POSITIONS = [
  'GK', 'CB', 'LB', 'RB', 'LWB', 'RWB',
  'CDM', 'CM', 'CAM', 'LM', 'RM',
  'LW', 'RW', 'CF', 'ST'
] as const;

export const RATING_COLORS = {
  GOLD: { min: 90, color: '#FFD700' },
  GREEN: { min: 80, color: '#00A651' },
  BLUE: { min: 70, color: '#4A9B9B' },
  GRAY: { min: 0, color: '#6B7280' }
} as const;

export const POSITION_COLORS = {
  ATTACKER: ['ST', 'CF', 'LW', 'RW'],
  MIDFIELDER: ['CAM', 'CM', 'CDM', 'LM', 'RM'],
  DEFENDER: ['CB', 'LB', 'RB', 'LWB', 'RWB'],
  GOALKEEPER: ['GK']
} as const;
