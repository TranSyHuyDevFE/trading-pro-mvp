import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { VendorResult, VendorCurrency } from '../../../../core/services/ai-sourcing.service';
import {
  CalculatorService,
  LandedCostInput,
  LandedCostResult,
} from '../../../../core/services/calculator.service';
import { SettingsService, AppSettings } from '../../../../core/services/settings.service';

/**
 * CostCalculatorComponent - Bottom Sheet Bảng tính Landed Cost
 *
 * ★ Công thức: Giá vốn = (Giá xưởng × Tỷ giá) + VAT + Phí vận chuyển
 * ★ Realtime: Tự động cập nhật khi Settings thay đổi (SettingsService subscribe)
 */
@Component({
  selector: 'app-cost-calculator',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './cost-calculator.component.html',
  styleUrls: ['./cost-calculator.component.scss'],
})
export class CostCalculatorComponent implements OnInit, OnDestroy {
  @Input() vendor!: VendorResult;
  @Output() onClose = new EventEmitter<void>();

  // Thông số đầu vào — auto-fill từ vendor + settings
  input: LandedCostInput = {
    price:                0,
    currency:             'CNY',
    quantity:             100,
    exchange_rate:        3500,
    vat_rate:             10,
    shipping_fee_per_unit: 2000,
  };

  // Kết quả tính toán
  result: LandedCostResult | null = null;

  // Trạng thái animation
  isClosing = false;

  // Settings hiện tại (để hiển thị trong template nếu cần)
  currentSettings!: AppSettings;

  private settingsSub!: Subscription;

  constructor(
    private calculatorService: CalculatorService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    // ★ AUTO-FILL từ Vendor
    this.input.price    = this.vendor.price;
    this.input.currency = this.vendor.currency;
    this.input.quantity = Math.max(this.vendor.moq, 100);

    // ★ Subscribe SettingsService — realtime update khi settings thay đổi
    this.settingsSub = this.settingsService.settings$.subscribe(settings => {
      this.currentSettings = settings;
      this.applySettings(settings);
      this.calculate(); // Tính lại ngay khi settings đổi
    });
  }

  ngOnDestroy(): void {
    this.settingsSub?.unsubscribe();
  }

  /**
   * ★ Apply settings vào input — đây là trái tim reactive
   * Chỉ override tỷ giá nếu currency là CNY (settings chỉ lưu CNY rate)
   */
  private applySettings(settings: AppSettings): void {
    // Tỷ giá: lấy từ settings theo currency
    this.input.exchange_rate = this.settingsService.getExchangeRate(this.vendor.currency);

    // VAT từ settings
    this.input.vat_rate = settings.vatPercent;

    // Phí vận chuyển / SP = phí/kg × cân nặng/SP
    this.input.shipping_fee_per_unit = this.settingsService.getShippingPerUnit();
  }

  /**
   * ★ TÍNH TOÁN REALTIME — gọi mỗi khi bất kỳ input nào thay đổi
   */
  calculate(): void {
    this.result = this.calculatorService.calculateLandedCost(this.input);
  }

  /**
   * Format giá VND
   */
  fmtVND(amount: number): string {
    return this.calculatorService.formatVND(amount);
  }

  /**
   * Ký hiệu tiền tệ nguồn
   */
  getCurrencySymbol(): string {
    switch (this.input.currency) {
      case 'CNY': return '¥';
      case 'USD': return '$';
      case 'VND': return '₫';
      case 'KHR': return '៛';
      default:    return '';
    }
  }

  /**
   * Label tỷ giá
   */
  getExchangeLabel(): string {
    switch (this.input.currency) {
      case 'CNY': return 'TỶ GIÁ (CNY → VND)';
      case 'USD': return 'TỶ GIÁ (USD → VND)';
      case 'VND': return 'TỶ GIÁ (VND)';
      case 'KHR': return 'TỶ GIÁ (KHR → VND)';
      default:    return 'TỶ GIÁ';
    }
  }

  /**
   * Đóng Bottom Sheet với animation
   */
  close(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.onClose.emit();
    }, 280);
  }
}
