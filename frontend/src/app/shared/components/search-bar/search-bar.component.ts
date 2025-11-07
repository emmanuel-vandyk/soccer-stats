import { Component, output, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  template: `
    <div class="search-bar">
      <input
        type="text"
        class="search-input"
        placeholder="Search players..."
        [(ngModel)]="searchTerm"
        (ngModelChange)="onSearchChange($event)"
      />
      @if (searchTerm) {
        <button
          class="clear-btn"
          (click)="clearSearch()"
          type="button"
        >
          ✕
        </button>
      }
    </div>
  `,
  styles: [`
    .search-bar {
      display: flex;
      align-items: center;
      position: relative;
      width: 100%;
      max-width: 500px;
    }

    .search-input {
      flex: 1;
      padding: 12px 48px 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.2s;

      &:focus {
        outline: none;
        border-color: #3b82f6;
      }

      &::placeholder {
        color: #9ca3af;
      }
    }

    .clear-btn {
      position: absolute;
      right: 12px;
      padding: 4px 8px;
      border: none;
      background: transparent;
      color: #6b7280;
      cursor: pointer;
      font-size: 18px;

      &:hover {
        color: #ef4444;
      }
    }
  `]
})
export class SearchBarComponent implements OnDestroy {
  search = output<string>();

  searchTerm = '';
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(term => {
        this.search.emit(term);
      });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.search.emit('');
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }
}
