import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

/**
 * EmptyStateComponent - Giao diện hiển thị khi chưa có kết quả
 * Dùng khi chưa search gì hoặc không tìm thấy kết quả
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <div class="empty-state">
      <ion-icon [name]="icon" class="empty-icon"></ion-icon>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
        text-align: center;
      }

      .empty-icon {
        font-size: 72px;
        color: var(--ion-color-medium);
        margin-bottom: 16px;
      }

      h3 {
        font-size: 20px;
        font-weight: 600;
        color: var(--ion-color-dark);
        margin-bottom: 8px;
      }

      p {
        font-size: 14px;
        color: var(--ion-color-medium);
        max-width: 280px;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon = 'search-outline';
  @Input() title = 'Chưa có kết quả';
  @Input() description = 'Nhập từ khóa sản phẩm để bắt đầu tìm kiếm xưởng cung cấp';
}
