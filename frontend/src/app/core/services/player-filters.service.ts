import { Injectable, signal, effect } from '@angular/core';

export interface PlayerFiltersState {
  searchQuery: string;
  selectedPosition: string;
  selectedOverallRange: string;
  selectedFifaVersion: string;
  selectedClub: string;
  currentGender: 'M' | 'F' | undefined;
  showTopRated: boolean;
  currentPage: number;
  viewMode: 'cards' | 'table';
}

/**
 * Global state service for player list filters
 * Maintains filter state across navigation with localStorage persistence
 */
@Injectable({
  providedIn: 'root'
})
export class PlayerFiltersService {
  private readonly STORAGE_KEY = 'player-filters-state';

  // Default state
  private readonly defaultState: PlayerFiltersState = {
    searchQuery: '',
    selectedPosition: '',
    selectedOverallRange: '',
    selectedFifaVersion: '',
    selectedClub: '',
    currentGender: undefined,
    showTopRated: false,
    currentPage: 1,
    viewMode: 'cards'
  };

  // Global state signals - initialized from localStorage
  readonly filters = signal<PlayerFiltersState>(this.loadFromStorage());

  constructor() {
    // Auto-save to localStorage whenever filters change
    effect(() => {
      const currentFilters = this.filters();
      this.saveToStorage(currentFilters);
    });
  }

  /**
   * Load filters from localStorage
   */
  private loadFromStorage(): PlayerFiltersState {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.defaultState, ...parsed };
      }
    } catch (error) {
      console.error('Error loading filters from localStorage:', error);
    }
    return { ...this.defaultState };
  }

  /**
   * Save filters to localStorage
   */
  private saveToStorage(state: PlayerFiltersState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      ('💾 Saved filters to localStorage');
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }

  /**
   * Update entire filter state
   */
  updateFilters(newFilters: Partial<PlayerFiltersState>): void {
    this.filters.update(current => ({
      ...current,
      ...newFilters
    }));
  }

  /**
   * Update a single filter property
   */
  updateFilter<K extends keyof PlayerFiltersState>(
    key: K,
    value: PlayerFiltersState[K]
  ): void {
    this.filters.update(current => ({
      ...current,
      [key]: value
    }));
  }

  /**
   * Reset all filters to default
   */
  resetFilters(): void {
    ('🗑️ Resetting filters to default');
    this.filters.set({ ...this.defaultState });
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get current filter state
   */
  getFilters(): PlayerFiltersState {
    return this.filters();
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(): boolean {
    const current = this.filters();
    return (
      current.searchQuery !== '' ||
      current.selectedPosition !== '' ||
      current.selectedOverallRange !== '' ||
      current.selectedFifaVersion !== '' ||
      current.selectedClub !== '' ||
      current.currentGender !== undefined ||
      current.showTopRated
    );
  }
}
