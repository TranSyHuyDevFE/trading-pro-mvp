import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Thông số cài đặt mặc định
 */
interface DefaultSettings {
  shipping_fee_per_kg: number;  // Phí ship mặc định (VND/kg)
  tax_rate: number;             // % Thuế nhập khẩu mặc định
  service_fee_rate: number;     // % Phí dịch vụ mặc định
  exchange_rate: number;        // Tỷ giá CNY/VND mặc định
  default_weight_kg: number;    // Cân nặng mặc định (kg/SP)
}

/**
 * SettingsPage - TAB 3: CÀI ĐẶT THÔNG SỐ
 * Cho phép người dùng nhập Phí ship, % Thuế, các thông số mặc định
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>⚙️ Cài đặt</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list-header>
        <ion-label>Thông số mặc định</ion-label>
      </ion-list-header>

      <ion-list inset>
        <ion-item>
          <ion-label position="stacked">Tỷ giá CNY/VND</ion-label>
          <ion-input
            type="number"
            [(ngModel)]="settings.exchange_rate"
            placeholder="3500"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Phí ship (VND/kg)</ion-label>
          <ion-input
            type="number"
            [(ngModel)]="settings.shipping_fee_per_kg"
            placeholder="25000"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Cân nặng / SP (kg)</ion-label>
          <ion-input
            type="number"
            [(ngModel)]="settings.default_weight_kg"
            placeholder="0.5"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Thuế nhập khẩu (%)</ion-label>
          <ion-input
            type="number"
            [(ngModel)]="settings.tax_rate"
            placeholder="10"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Phí dịch vụ (%)</ion-label>
          <ion-input
            type="number"
            [(ngModel)]="settings.service_fee_rate"
            placeholder="3"
          ></ion-input>
        </ion-item>
      </ion-list>

      <div class="ion-padding">
        <ion-button expand="block" (click)="saveSettings()" [disabled]="isSaving">
          <ion-spinner *ngIf="isSaving" name="crescent" slot="start"></ion-spinner>
          <ion-icon *ngIf="!isSaving" name="save-outline" slot="start"></ion-icon>
          {{ isSaving ? 'Đang lưu...' : 'Lưu cài đặt' }}
        </ion-button>
      </div>

      <ion-list-header>
        <ion-label>Thông tin</ion-label>
      </ion-list-header>

      <ion-list inset>
        <ion-item>
          <ion-label>Phiên bản</ion-label>
          <ion-note slot="end">MVP 1.0.0</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>Tỷ giá cập nhật lần cuối</ion-label>
          <ion-note slot="end">{{ lastRateUpdate }}</ion-note>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
})
export class SettingsPage implements OnInit {
  settings: DefaultSettings = {
    shipping_fee_per_kg: 25000,
    tax_rate: 10,
    service_fee_rate: 3,
    exchange_rate: 3500,
    default_weight_kg: 0.5,
  };

  lastRateUpdate = 'Chưa cập nhật';
  isSaving = false;

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  /**
   * Load settings từ localStorage
   */
  loadSettings(): void {
    const saved = localStorage.getItem('trading_settings');
    if (saved) {
      this.settings = JSON.parse(saved);
    }
  }

  /**
   * Lưu settings với loading + toast thông báo
   */
  async saveSettings(): Promise<void> {
    this.isSaving = true;

    // Hiển thị loading
    const loading = await this.loadingController.create({
      message: 'Đang lưu cài đặt...',
      spinner: 'crescent',
      duration: 1000,
    });
    await loading.present();

    // Giả lập delay (thực tế sẽ gọi API)
    setTimeout(async () => {
      // Lưu vào localStorage
      localStorage.setItem('trading_settings', JSON.stringify(this.settings));

      // Đóng loading
      await loading.dismiss();
      this.isSaving = false;

      // Hiển thị toast thông báo thành công
      const toast = await this.toastController.create({
        message: 'Đã lưu cài đặt thành công!',
        duration: 2000,
        position: 'top',
        color: 'success',
        icon: 'checkmark-circle-outline',
        cssClass: 'settings-toast',
      });
      await toast.present();
    }, 800);
  }
}
