import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

/**
 * LoadingOverlayComponent - Màn hình chờ khi AI đang quét
 * Hiển thị animation loading với thông báo trạng thái
 */
@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <div class="loading-overlay" *ngIf="isLoading">
      <div class="loading-content">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="loading-message">{{ message }}</p>
        <p class="loading-sub" *ngIf="subMessage">{{ subMessage }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      .loading-content {
        text-align: center;
        color: white;
      }

      .loading-message {
        margin-top: 16px;
        font-size: 18px;
        font-weight: 600;
      }

      .loading-sub {
        margin-top: 8px;
        font-size: 14px;
        opacity: 0.7;
      }

      ion-spinner {
        width: 48px;
        height: 48px;
      }
    `,
  ],
})
export class LoadingOverlayComponent {
  @Input() isLoading = false;
  @Input() message = 'AI đang quét dữ liệu...';
  @Input() subMessage = 'Vui lòng chờ trong giây lát';
}
