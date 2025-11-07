import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-skeleton',
  imports: [CommonModule],
  template: `
    <div class="table-skeleton">
      <div class="skeleton-header">
        @for (column of columnsArray(); track $index) {
          <div class="skeleton-cell skeleton-shimmer"></div>
        }
      </div>
      @for (row of rowsArray(); track $index) {
        <div class="skeleton-row">
          @for (column of columnsArray(); track $index) {
            <div class="skeleton-cell skeleton-shimmer"></div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .table-skeleton {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
    }

    .skeleton-header,
    .skeleton-row {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .skeleton-header {
      background-color: #f9fafb;
      font-weight: 600;
    }

    .skeleton-row:last-child {
      border-bottom: none;
    }

    .skeleton-cell {
      height: 1.5rem;
      background-color: #e5e7eb;
      border-radius: 4px;
    }

    .skeleton-shimmer {
      animation: shimmer 1.5s infinite;
      background: linear-gradient(
        90deg,
        #e5e7eb 0%,
        #f3f4f6 50%,
        #e5e7eb 100%
      );
      background-size: 200% 100%;
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableSkeletonComponent {
  rows = input<number>(5);
  columns = input<number>(5);

  rowsArray = computed(() => Array.from({ length: this.rows() }));
  columnsArray = computed(() => Array.from({ length: this.columns() }));
}
