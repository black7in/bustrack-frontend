import { Component, input, output, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';

export interface DataTableColumn<T> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  template?: 'default' | 'badge' | 'mono' | 'money';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatPaginatorModule, MatTableModule, MatSortModule],
  template: `
    <div class="table-card card">
      <div class="table-header">
        <div class="table-header-left">
          @if (searchable()) {
            <div class="search-box">
              <mat-icon class="search-icon">search</mat-icon>
              <input
                class="search-input"
                placeholder="Buscar..."
                [value]="searchTerm()"
                (input)="onSearch($any($event.target).value)"
              />
            </div>
          }
          <ng-content select="[filters]"></ng-content>
        </div>
        <div class="table-header-right">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>

      <div class="table-wrapper">
        <table mat-table [dataSource]="data()" matSort (matSortChange)="onSortChange($event)" class="tbl">
          @for (col of columns(); track col.key) {
            <ng-container [matColumnDef]="col.key">
              <th mat-header-cell *matHeaderCellDef [mat-sort-header]="col.sortable ? col.key : ''" [disabled]="!col.sortable">
                {{ col.label }}
              </th>
              <td mat-cell *matCellDef="let row">
                <ng-container [ngSwitch]="col.template">
                  <span *ngSwitchCase="'mono'" class="mono">{{ row[col.key] }}</span>
                  <span *ngSwitchCase="'money'" class="mono">Bs {{ row[col.key] | number }}</span>
                  <ng-content *ngSwitchCase="'badge'" select="[col-{{ col.key }}]" [ngTemplateOutletContext]="{ $implicit: row }"></ng-content>
                  <span *ngSwitchDefault>{{ row[col.key] }}</span>
                </ng-container>
              </td>
            </ng-container>
          }

          <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" [attr.colspan]="columns().length">
              <div class="empty-state">
                <mat-icon class="empty-icon">inbox</mat-icon>
                <span>No se encontraron resultados</span>
              </div>
            </td>
          </tr>
        </table>
      </div>

      @if (paginated()) {
        <mat-paginator
          [length]="total()"
          [pageSize]="pageSize()"
          [pageSizeOptions]="pageSizeOptions()"
          [pageIndex]="currentPage()"
          (page)="onPageChange($event)"
          showFirstLastButtons
        />
      }
    </div>
  `,
  styles: `
    .card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--r-lg);
      box-shadow: var(--shadow-sm);
    }
    .table-card {
      overflow: hidden;
    }
    .table-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--color-divider);
    }
    .table-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
    }
    .table-header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .search-box {
      position: relative;
    }
    .search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: var(--ink-400);
    }
    .search-input {
      height: 32px;
      padding: 0 12px 0 32px;
      border-radius: var(--r-md);
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      font-size: 12.5px;
      color: var(--color-text-primary);
      width: 260px;
      outline: none;

      &:focus {
        border-color: var(--color-primary-light);
        box-shadow: 0 0 0 3px rgba(var(--brand-800-rgb), 0.12);
      }
    }
    .table-wrapper {
      overflow: auto;
    }
    .tbl {
      width: 100%;
    }
    .mono {
      font-family: var(--font-mono);
      font-feature-settings: 'tnum' 1;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 48px;
      color: var(--color-text-secondary);
      font-size: 14px;
    }
    .empty-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      opacity: 0.4;
    }
    ::ng-deep .tbl thead th {
      text-align: left;
      font-size: 11.5px !important;
      font-weight: 600 !important;
      color: var(--color-text-secondary) !important;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 10px 16px !important;
      border-bottom: 1px solid var(--color-border);
      background: var(--ink-050);
    }
    ::ng-deep .tbl tbody td {
      padding: 14px 16px !important;
      border-bottom: 1px solid var(--color-divider);
      color: var(--color-text-primary);
      vertical-align: middle;
      font-size: 13px;
    }
    ::ng-deep .tbl tbody tr:hover {
      background: var(--ink-050);
    }
    ::ng-deep .tbl tbody tr:last-child td {
      border-bottom: 0;
    }
  `,
})
export class DataTableComponent<T extends Record<string, any>> {
  readonly data = input<T[]>([]);
  readonly columns = input<DataTableColumn<T>[]>([]);
  readonly total = input(0);
  readonly pageSize = input(10);
  readonly currentPage = input(0);
  readonly pageSizeOptions = input([5, 10, 25, 50]);
  readonly searchTerm = input('');
  readonly paginated = input(true);
  readonly searchable = input(true);

  readonly pageChange = output<PageEvent>();
  readonly sortChange = output<Sort>();
  readonly search = output<string>();

  readonly displayedColumns = computed(() => this.columns().map((c) => c.key as string));

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit(sort);
  }

  onSearch(value: string): void {
    this.search.emit(value);
  }
}
