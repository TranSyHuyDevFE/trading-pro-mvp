import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { VendorResult, VendorCurrency } from '../../../../core/services/ai-sourcing.service';

/**
 * VendorCardComponent - Card UI cho mỗi kết quả xưởng
 * Hiển thị: Tên, SĐT, Vị trí, Nhãn liên hệ (Wechat/Zalo)
 * 3 Action: "Xem Info Xưởng", "Mở Trang Sản Phẩm", "Chọn → Tính giá"
 */
@Component({
  selector: 'app-vendor-card',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <ion-card class="vendor-card">
      <!-- Header: Index + Country Badge -->
      <ion-card-header>
        <div class="vendor-header">
          <div class="header-left">
            <span class="vendor-index">#{{ index + 1 }}</span>
            <ion-card-title>{{ vendor.name }}</ion-card-title>
          </div>
          <span
            class="country-badge"
            [class.vn]="vendor.country === 'VN'"
            [class.tq]="vendor.country === 'TQ'"
            [class.kh]="vendor.country === 'KH'"
          >
            {{ vendor.country === 'VN' ? '🇻🇳 VN' : vendor.country === 'TQ' ? '🇨🇳 TQ' : '🇰🇭 KH' }}
          </span>
        </div>
      </ion-card-header>

      <ion-card-content>
        <!-- Info Row: Vị trí + SĐT -->
        <div class="vendor-info-row">
          <div class="info-item">
            <ion-icon name="location-outline" color="primary"></ion-icon>
            <span>{{ vendor.location }}</span>
          </div>
          <div class="info-item">
            <ion-icon name="call-outline" color="primary"></ion-icon>
            <span>{{ vendor.phone }}</span>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="vendor-stats">
          <div class="stat-item">
            <span class="stat-value price">{{ formatPrice(vendor.price, vendor.currency) }}</span>
            <span class="stat-label">Giá gốc</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ vendor.moq }}</span>
            <span class="stat-label">MOQ (cái)</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">⭐ {{ vendor.rating }}</span>
            <span class="stat-label">Đánh giá</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ vendor.years_on_platform }} năm</span>
            <span class="stat-label">Hoạt động</span>
          </div>
        </div>

        <!-- Contact Badge: Wechat / Zalo -->
        <div class="contact-badge-row">
          <span
            class="contact-badge"
            [class.wechat]="vendor.contact_type === 'wechat'"
            [class.zalo]="vendor.contact_type === 'zalo'"
          >
            <ion-icon
              [name]="vendor.contact_type === 'wechat' ? 'chatbubbles-outline' : vendor.contact_type === 'zalo' ? 'chatbubble-ellipses-outline' : 'call-outline'"
            ></ion-icon>
            {{ vendor.contact_type === 'wechat' ? 'WeChat' : vendor.contact_type === 'zalo' ? 'Zalo' : 'Phone' }}:
            <strong>{{ vendor.phone }}</strong>
          </span>
        </div>

        <!-- Description -->
        <p class="vendor-description" *ngIf="vendor.description">
          {{ vendor.description }}
        </p>

        <!-- ★ NÚT CHỌN - Mở Bảng tính Landed Cost -->
        <button class="cta-select-btn" (click)="selectVendor()">
          <span class="cta-shimmer"></span>
          <span class="cta-content">
            <span class="cta-icon">🧮</span>
            <span class="cta-text">
              <span class="cta-main">Tính giá vốn</span>
              <span class="cta-sub">Landed cost · Phân tích lợi nhuận</span>
            </span>
            <ion-icon name="chevron-forward-outline" class="cta-arrow"></ion-icon>
          </span>
        </button>

        <!-- 2 Action Buttons phụ -->
        <div class="vendor-actions">
          <ion-button fill="clear" size="small" color="tertiary" (click)="viewVendorInfo()">
            <ion-icon name="business-outline" slot="start"></ion-icon>
            Xem Info Xưởng
          </ion-button>
          <ion-button fill="clear" size="small" color="primary" (click)="openProductPage()">
            <ion-icon name="open-outline" slot="start"></ion-icon>
            Mở Trang Sản Phẩm
          </ion-button>
        </div>
      </ion-card-content>
    </ion-card>
  `,
  styleUrls: ['./vendor-card.component.scss'],
})
export class VendorCardComponent {
  @Input() vendor!: VendorResult;
  @Input() index = 0;
  @Output() onSelect = new EventEmitter<VendorResult>();

  /**
   * Format giá theo đúng tiền tệ
   */
  formatPrice(price: number, currency: VendorCurrency): string {
    switch (currency) {
      case 'CNY':
        return `¥${price.toFixed(2)}`;
      case 'VND':
        return `${price.toLocaleString('vi-VN')}₫`;
      case 'USD':
        return `$${price.toFixed(2)}`;
      case 'KHR':
        return `៛${price.toLocaleString()}`;
      default:
        return `${price}`;
    }
  }

  /**
   * ★ Chọn xưởng → Mở Bottom Sheet tính giá vốn
   * Emit vendor data để sourcing page mở bảng tính
   */
  selectVendor(): void {
    this.onSelect.emit(this.vendor);
  }

  /**
   * Mở trang chi tiết xưởng (Info)
   */
  viewVendorInfo(): void {
    console.log('Xem info xưởng:', this.vendor.name);
  }

  /**
   * Mở trang sản phẩm gốc
   */
  openProductPage(): void {
    window.open(this.vendor.url, '_blank');
  }
}
