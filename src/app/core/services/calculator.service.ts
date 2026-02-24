import { Injectable } from '@angular/core';
import { VendorCurrency } from './ai-sourcing.service';

/**
 * Thông số đầu vào cho Landed Cost
 * Công thức: Giá vốn = (Giá xưởng × Tỷ giá) + VAT + Phí vận chuyển
 */
export interface LandedCostInput {
  price: number;               // Giá xưởng (theo đơn vị tiền tệ gốc)
  currency: VendorCurrency;    // Đơn vị tiền tệ gốc (CNY, VND, USD, KHR)
  quantity: number;             // Số lượng đặt
  exchange_rate: number;        // Tỷ giá: đơn vị gốc → VND
  vat_rate: number;             // % VAT
  shipping_fee_per_unit: number; // Phí vận chuyển / sản phẩm (VND)
}

/**
 * Kết quả tính Landed Cost
 */
export interface LandedCostResult {
  price_vnd_per_unit: number;   // Giá xưởng quy đổi VND / SP
  vat_per_unit: number;         // VAT / SP (VND)
  shipping_per_unit: number;    // Phí vận chuyển / SP (VND)
  landed_cost_per_unit: number; // *** GIÁ VỐN / SP (VND) ***
  total_cost: number;           // Tổng giá vốn (VND) = landed_cost × quantity
}

// Giữ lại interface cũ cho backward compatibility
export interface CostInput {
  price_cny: number;
  quantity: number;
  exchange_rate: number;
  shipping_fee_per_kg: number;
  weight_per_unit_kg: number;
  tax_rate: number;
  service_fee_rate: number;
}

export interface CostResult {
  price_vnd: number;
  total_shipping: number;
  total_tax: number;
  total_service_fee: number;
  cost_per_unit: number;
  total_cost: number;
}

/**
 * CalculatorService - Logic tính Landed Cost
 *
 * Công thức chính:
 * Giá vốn = (Giá xưởng × Tỷ giá) + VAT + Phí vận chuyển
 */
@Injectable({
  providedIn: 'root',
})
export class CalculatorService {
  /**
   * ★ CÔNG THỨC CHÍNH - Tính Landed Cost
   *
   * Giá vốn / SP = (Giá xưởng × Tỷ giá) + VAT + Phí vận chuyển
   *
   * @param input - Thông số đầu vào
   * @returns Kết quả chi tiết Landed Cost
   */
  calculateLandedCost(input: LandedCostInput): LandedCostResult {
    // Bước 1: Giá xưởng quy đổi VND
    const price_vnd_per_unit = input.price * input.exchange_rate;

    // Bước 2: VAT trên giá VND
    const vat_per_unit = price_vnd_per_unit * (input.vat_rate / 100);

    // Bước 3: Phí vận chuyển / SP
    const shipping_per_unit = input.shipping_fee_per_unit;

    // ★ Bước 4: GIÁ VỐN (Landed Cost) = Giá VND + VAT + Shipping
    const landed_cost_per_unit = price_vnd_per_unit + vat_per_unit + shipping_per_unit;

    // Bước 5: Tổng chi phí
    const total_cost = landed_cost_per_unit * input.quantity;

    return {
      price_vnd_per_unit,
      vat_per_unit,
      shipping_per_unit,
      landed_cost_per_unit,
      total_cost,
    };
  }

  /**
   * Tính toán giá vốn đầy đủ (Legacy - giữ lại cho backward compat)
   */
  calculateCost(input: CostInput): CostResult {
    const price_vnd = input.price_cny * input.exchange_rate;
    const total_shipping = input.shipping_fee_per_kg * input.weight_per_unit_kg * input.quantity;
    const total_tax = price_vnd * input.quantity * (input.tax_rate / 100);
    const total_service_fee = price_vnd * input.quantity * (input.service_fee_rate / 100);
    const total_cost = price_vnd * input.quantity + total_shipping + total_tax + total_service_fee;
    const cost_per_unit = total_cost / input.quantity;

    return { price_vnd, total_shipping, total_tax, total_service_fee, cost_per_unit, total_cost };
  }

  formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Math.round(amount));
  }

  formatCNY(amount: number): string {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  }
}
