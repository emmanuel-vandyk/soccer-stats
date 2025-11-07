/**
 * Sort order types
 */
export type SortOrder = 'ASC' | 'DESC';

/**
 *  Player gender
 */
export type Gender = 'M' | 'F';

/**
 * Export formats for data export
 */
export type ExportFormat = 'csv' | 'xlsx';

/**
 * State of loading with error handling
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Soccer player positions
 */
export enum PlayerPosition {
  GK = 'GK',
  CB = 'CB',
  LB = 'LB',
  RB = 'RB',
  LWB = 'LWB',
  RWB = 'RWB',
  CDM = 'CDM',
  CM = 'CM',
  CAM = 'CAM',
  LM = 'LM',
  RM = 'RM',
  LW = 'LW',
  RW = 'RW',
  CF = 'CF',
  ST = 'ST'
}

/**
 * Setup for pagination
 */
export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
