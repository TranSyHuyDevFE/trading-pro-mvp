import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../core/services/settings.service';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
    <ion-header class="settings-header ion-no-border">
      <ion-toolbar class="settings-toolbar">
        <!-- Back button -->
        <button class="settings-back-btn" (click)="goBack()" slot="start" aria-label="Quay lại">
          <ion-icon name="arrow-back-outline"></ion-icon>
        </button>

        <div class="settings-title-wrap">
          <span class="settings-title"></span>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="settings-content">
      <!-- Hero Card -->
      <div class="settings-hero">
        <div class="hero-icon-wrap">
          <div class="hero-icon">⚙️</div>
          <div class="hero-glow"></div>
        </div>
        <h2 class="hero-title">Thông số mặc định</h2>
        <p class="hero-sub">Điều chỉnh các tham số tính giá vốn của bạn</p>
      </div>

      <!-- Settings Cards -->
      <div class="settings-cards">

        <!-- Exchange Rate -->
        <div class="setting-card">
          <div class="card-header">
            <div class="card-icon-wrap card-icon--yellow">
              <ion-icon name="trending-up-outline"></ion-icon>
            </div>
            <div class="card-label-wrap">
              <span class="card-label">Tỷ giá CNY/VND</span>
              <span class="card-hint">Tỷ giá Nhân Dân Tệ sang Đồng</span>
            </div>
          </div>
          <div class="card-input-wrap">
            <input
              type="number"
              class="card-input"
              [(ngModel)]="exchangeRateManual"
              placeholder="3500"
            />
            <span class="card-unit">VND</span>
          </div>
        </div>

        <!-- Shipping Fee -->
        <div class="setting-card">
          <div class="card-header">
            <div class="card-icon-wrap card-icon--blue">
              <ion-icon name="airplane-outline"></ion-icon>
            </div>
            <div class="card-label-wrap">
              <span class="card-label">Phí ship (VND/kg)</span>
              <span class="card-hint">Chi phí vận chuyển mỗi kg hàng</span>
            </div>
          </div>
          <div class="card-input-wrap">
            <input
              type="number"
              class="card-input"
              [(ngModel)]="shippingFeePerKg"
              placeholder="2000"
            />
            <span class="card-unit">VND/kg</span>
          </div>
        </div>

        <!-- Weight per product -->
        <div class="setting-card">
          <div class="card-header">
            <div class="card-icon-wrap card-icon--green">
              <ion-icon name="scale-outline"></ion-icon>
            </div>
            <div class="card-label-wrap">
              <span class="card-label">Cân nặng / SP</span>
              <span class="card-hint">Trọng lượng trung bình mỗi sản phẩm</span>
            </div>
          </div>
          <div class="card-input-wrap">
            <input
              type="number"
              class="card-input"
              [(ngModel)]="defaultWeightKg"
              placeholder="0.5"
            />
            <span class="card-unit">kg</span>
          </div>
        </div>

        <!-- Tax Rate -->
        <div class="setting-card">
          <div class="card-header">
            <div class="card-icon-wrap card-icon--red">
              <ion-icon name="receipt-outline"></ion-icon>
            </div>
            <div class="card-label-wrap">
              <span class="card-label">Thuế nhập khẩu</span>
              <span class="card-hint">Phần trăm thuế áp lên giá hàng</span>
            </div>
          </div>
          <div class="card-input-wrap">
            <input
              type="number"
              class="card-input"
              [(ngModel)]="vatPercent"
              placeholder="10"
            />
            <span class="card-unit">%</span>
          </div>
        </div>

        <!-- Service Fee -->
        <div class="setting-card">
          <div class="card-header">
            <div class="card-icon-wrap card-icon--purple">
              <ion-icon name="sparkles-outline"></ion-icon>
            </div>
            <div class="card-label-wrap">
              <span class="card-label">Phí dịch vụ</span>
              <span class="card-hint">Phần trăm phí platform / dịch vụ</span>
            </div>
          </div>
          <div class="card-input-wrap">
            <input
              type="number"
              class="card-input"
              [(ngModel)]="serviceFeeRate"
              placeholder="3"
            />
            <span class="card-unit">%</span>
          </div>
        </div>

      </div>

      <!-- Save Button -->
      <div class="save-wrap">
        <button class="save-btn" (click)="saveSettings()" [disabled]="isSaving">
          <ion-spinner *ngIf="isSaving" name="crescent" class="save-spinner"></ion-spinner>
          <ion-icon *ngIf="!isSaving" name="checkmark-circle-outline"></ion-icon>
          <span>{{ isSaving ? 'Đang lưu...' : 'Lưu cài đặt' }}</span>
        </button>
      </div>

      <!-- App Info -->
      <div class="app-info-card">
        <div class="info-row">
          <span class="info-label">🚀 Phiên bản</span>
          <span class="info-value">MVP 1.0.0</span>
        </div>
        <div class="info-divider"></div>
        <div class="info-row">
          <span class="info-label">🕐 Tỷ giá cập nhật</span>
          <span class="info-value">{{ lastRateUpdate }}</span>
        </div>
      </div>

      <div class="bottom-spacer"></div>
    </ion-content>
  `,
  styles: [`
    // ======= PALETTE =======
    $grad: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    $grad-dark: linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%);
    $surface: #f8faff;
    $card-bg: #ffffff;
    $border: #e8ecf4;
    $text-primary: #1a1d3a;
    $text-secondary: #64748b;
    $shadow-card: 0 2px 16px rgba(99, 102, 241, 0.08);
    $shadow-hover: 0 6px 24px rgba(99, 102, 241, 0.14);

    // ======= HEADER =======
    .settings-header {
      ion-toolbar {
        --background: transparent;
        --border-width: 0;
        --padding-start: 0;
        --padding-end: 0;
      }
    }

    .settings-toolbar {
      background: $grad !important;
      padding: 0 16px !important;
      display: flex;
      align-items: center;
      min-height: 56px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.12) 0%, transparent 70%);
        pointer-events: none;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0; left: 10%; right: 10%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
      }
    }

    // Back Button
    .settings-back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.12);
      color: #fff;
      cursor: pointer;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: all 0.25s ease;
      flex-shrink: 0;
      position: relative;
      z-index: 1;

      ion-icon {
        font-size: 20px;
        transition: transform 0.25s ease;
      }

      &:hover {
        background: rgba(255,255,255,0.22);
        border-color: rgba(255,255,255,0.4);

        ion-icon { transform: translateX(-2px); }
      }

      &:active { transform: scale(0.9); }
    }

    // Title
    .settings-title-wrap {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      z-index: 1;
      // Offset để compensate cho back button
      padding-right: 38px;
    }

    .settings-title {
      color: #fff;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.3px;
      text-shadow: 0 1px 4px rgba(0,0,0,0.12);
    }

    // ======= CONTENT =======
    .settings-content {
      --background: #{$surface};
    }

    // Hero Section
    .settings-hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 24px 20px;

      .hero-icon-wrap {
        position: relative;
        margin-bottom: 14px;

        .hero-icon {
          font-size: 48px;
          line-height: 1;
          filter: drop-shadow(0 4px 12px rgba(99,102,241,0.3));
          animation: float-icon 3s ease-in-out infinite;
        }

        .hero-glow {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 48px;
          height: 10px;
          background: radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%);
          border-radius: 50%;
        }
      }

      .hero-title {
        margin: 0 0 6px;
        font-size: 22px;
        font-weight: 800;
        color: $text-primary;
        letter-spacing: -0.4px;
      }

      .hero-sub {
        margin: 0;
        font-size: 14px;
        color: $text-secondary;
        text-align: center;
      }
    }

    // ======= SETTING CARDS =======
    .settings-cards {
      padding: 0 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .setting-card {
      background: $card-bg;
      border-radius: 20px;
      padding: 16px;
      box-shadow: $shadow-card;
      border: 1px solid $border;
      transition: all 0.25s ease;

      &:hover {
        box-shadow: $shadow-hover;
        transform: translateY(-1px);
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
      }

      .card-icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 14px;
        flex-shrink: 0;

        ion-icon {
          font-size: 20px;
          color: #fff;
        }

        &.card-icon--yellow { background: linear-gradient(135deg, #f59e0b, #f97316); }
        &.card-icon--blue   { background: linear-gradient(135deg, #3b82f6, #6366f1); }
        &.card-icon--green  { background: linear-gradient(135deg, #10b981, #059669); }
        &.card-icon--red    { background: linear-gradient(135deg, #ef4444, #f97316); }
        &.card-icon--purple { background: linear-gradient(135deg, #8b5cf6, #ec4899); }
      }

      .card-label-wrap {
        display: flex;
        flex-direction: column;

        .card-label {
          font-size: 15px;
          font-weight: 700;
          color: $text-primary;
          line-height: 1.2;
        }

        .card-hint {
          font-size: 12px;
          color: $text-secondary;
          margin-top: 2px;
        }
      }

      .card-input-wrap {
        display: flex;
        align-items: center;
        background: $surface;
        border-radius: 14px;
        border: 1.5px solid $border;
        overflow: hidden;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:focus-within {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .card-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          padding: 12px 14px;
          font-size: 16px;
          font-weight: 600;
          color: $text-primary;

          &::placeholder { color: #cbd5e1; font-weight: 400; }
        }

        .card-unit {
          padding: 0 14px 0 0;
          font-size: 12px;
          font-weight: 700;
          color: $text-secondary;
          white-space: nowrap;
        }
      }
    }

    // ======= SAVE BUTTON =======
    .save-wrap {
      padding: 24px 16px 12px;
    }

    .save-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 16px;
      border: none;
      border-radius: 20px;
      background: $grad;
      color: #fff;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(99,102,241,0.35);
      transition: all 0.25s ease;
      letter-spacing: 0.2px;

      ion-icon {
        font-size: 20px;
      }

      .save-spinner {
        width: 18px;
        height: 18px;
        --color: #fff;
      }

      &:hover {
        box-shadow: 0 8px 32px rgba(99,102,241,0.45);
        transform: translateY(-2px);
      }

      &:active {
        transform: scale(0.97);
        box-shadow: 0 2px 12px rgba(99,102,241,0.3);
      }

      &[disabled] {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
        box-shadow: 0 4px 16px rgba(99,102,241,0.2);
      }
    }

    // ======= APP INFO CARD =======
    .app-info-card {
      margin: 0 16px;
      background: $card-bg;
      border-radius: 20px;
      border: 1px solid $border;
      box-shadow: $shadow-card;
      overflow: hidden;

      .info-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;

        .info-label {
          font-size: 14px;
          color: $text-secondary;
          font-weight: 500;
        }

        .info-value {
          font-size: 13px;
          font-weight: 700;
          color: $text-primary;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }

      .info-divider {
        height: 1px;
        background: $border;
        margin: 0 16px;
      }
    }

    .bottom-spacer { height: 32px; }

    // ======= ANIMATIONS =======
    @keyframes float-icon {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
  `]
})
export class SettingsPage implements OnInit, OnDestroy {
  // Form model — ánh xạ 1-1 với AppSettings
  vatPercent         = 10;
  shippingFeePerKg   = 2000;
  exchangeRateManual = 3500;
  defaultWeightKg    = 0.5;
  serviceFeeRate     = 3;

  lastRateUpdate = 'Chưa cập nhật';
  isSaving = false;

  private settingsSub!: Subscription;

  constructor(
    private toastController: ToastController,
    private settingsService: SettingsService,
    private location: Location
  ) {}

  ngOnInit(): void {
    // ★ Subscribe SettingsService — realtime update khi settings thay đổi (VD: tỷ giá lấy từ API)
    this.settingsSub = this.settingsService.settings$.subscribe(s => {
      this.vatPercent         = s.vatPercent;
      this.shippingFeePerKg   = s.shippingFeePerKg;
      this.exchangeRateManual = s.exchangeRateManual;
      this.defaultWeightKg    = s.defaultWeightKg;
      this.serviceFeeRate     = s.serviceFeeRate;
      
      this.lastRateUpdate = new Date().toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    });
  }

  ngOnDestroy(): void {
    if (this.settingsSub) {
      this.settingsSub.unsubscribe();
    }
  }

  goBack(): void {
    this.location.back();
  }

  async saveSettings(): Promise<void> {
    this.isSaving = true;

    // ★ Cập nhật qua SettingsService — BehaviorSubject phát ngay lập tức
    // CostCalculator đang subscribe sẽ nhận được thay đổi realtime
    this.settingsService.update({
      vatPercent:         Number(this.vatPercent),
      shippingFeePerKg:   Number(this.shippingFeePerKg),
      exchangeRateManual: Number(this.exchangeRateManual),
      defaultWeightKg:    Number(this.defaultWeightKg),
      serviceFeeRate:     Number(this.serviceFeeRate),
    });

    // Hiệu ứng nhỏ để user biết đã lưu
    await new Promise(r => setTimeout(r, 400));
    this.isSaving = false;

    const toast = await this.toastController.create({
      message: '✅ Đã lưu cài đặt! Giá vốn đã được cập nhật.',
      duration: 2500,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle-outline',
    });
    await toast.present();
  }
}
