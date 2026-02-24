import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorResult, VendorCurrency } from '../../../../core/services/ai-sourcing.service';
import {
  CalculatorService,
  LandedCostInput,
  LandedCostResult,
} from '../../../../core/services/calculator.service';

/**
 * CostCalculatorComponent - Bottom Sheet Bảng tính Landed Cost
 *
 * ★ Công thức: Giá vốn = (Giá xưởng × Tỷ giá) + VAT + Phí vận chuyển
 *
 * - Trồi lên từ đáy màn hình (slide up animation)
 * - Auto-fill giá và đơn vị tệ khi chọn từ Vendor Card
 * - Realtime tính toán khi thay đổi bất kỳ thông số nào
 */
@Component({
  selector: 'app-cost-calculator',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './cost-calculator.component.html',
  styleUrls: ['./cost-calculator.component.scss'],
})
export class CostCalculatorComponent implements OnInit {
  @Input() vendor!: VendorResult;
  @Output() onClose = new EventEmitter<void>();

  // Thông số đầu vào - sẽ được auto-fill từ vendor
  input: LandedCostInput = {
    price: 0,
    currency: 'CNY',
    quantity: 100,
    exchange_rate: 3500,
    vat_rate: 10,
    shipping_fee_per_unit: 15000,
  };

  // Kết quả tính toán
  result: LandedCostResult | null = null;

  // Trạng thái animation
  isClosing = false;

  constructor(private calculatorService: CalculatorService) {}

  ngOnInit(): void {
    // ★ AUTO-FILL: Giá, currency và MOQ từ vendor
    this.input.price = this.vendor.price;
    this.input.currency = this.vendor.currency;
    this.input.quantity = Math.max(this.vendor.moq, 100);

    // ★ Tự set tỷ giá mặc định theo loại tiền
    this.setDefaultExchangeRate(this.vendor.currency);

    // Load settings từ localStorage (nếu có)
    this.loadSavedSettings();

    // Tính toán ngay lập tức
    this.calculate();
  }

  /**
   * Set tỷ giá mặc định theo currency
   */
  private setDefaultExchangeRate(currency: VendorCurrency): void {
    switch (currency) {
      case 'CNY':
        this.input.exchange_rate = 3500;
        break;
      case 'USD':
        this.input.exchange_rate = 25500;
        break;
      case 'VND':
        this.input.exchange_rate = 1; // Đã là VND, không cần quy đổi
        break;
      case 'KHR':
        this.input.exchange_rate = 6.2; // ~6.2 VND / 1 KHR
        break;
    }
  }

  /**
   * Load thông số đã lưu từ Settings tab
   */
  private loadSavedSettings(): void {
    const saved = localStorage.getItem('trading_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      // Chỉ override tỷ giá từ settings nếu vendor dùng CNY
      if (this.vendor.currency === 'CNY') {
        this.input.exchange_rate = settings.exchange_rate || 3500;
      }
      this.input.vat_rate = settings.tax_rate || 10;
      this.input.shipping_fee_per_unit =
        (settings.shipping_fee_per_kg || 25000) * (settings.default_weight_kg || 0.5);
    }
  }

  /**
   * ★ TÍNH TOÁN REALTIME
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
      default: return '';
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
      default: return 'TỶ GIÁ';
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
