import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';

/**
 * Cấu trúc Settings — 3 biến cốt lõi cho Landed Cost
 */
export interface AppSettings {
  /** % VAT / Thuế nhập khẩu. Mặc định: 10 */
  vatPercent: number;

  /** Phí vận chuyển mỗi kg (VND/kg). Mặc định: 2000đ */
  shippingFeePerKg: number;

  /** Tỷ giá CNY → VND do user nhập tay. Mặc định: 3500 */
  exchangeRateManual: number;

  /** Timestamp lần cuối đồng bộ tỷ giá từ API (ms) */
  lastSyncTimestamp?: number;

  // Extended settings (giữ tương thích với SettingsPage cũ)
  defaultWeightKg: number;     // Cân nặng mặc định / SP (kg). Default: 0.5
  serviceFeeRate: number;      // % Phí dịch vụ. Default: 3
}

const STORAGE_KEY = 'trading_settings_v2';

const DEFAULT_SETTINGS: AppSettings = {
  vatPercent:         10,
  shippingFeePerKg:   2000,
  exchangeRateManual: 3500,
  defaultWeightKg:    0.5,
  serviceFeeRate:     3,
};

/**
 * SettingsService — Single source of truth cho toàn bộ settings app
 *
 * ★ Reactive: CostCalculator subscribe để cập nhật realtime khi settings thay đổi
 * ★ Persistent: Lưu vào localStorage, load lại khi khởi động
 * ★ Type-safe: AppSettings interface với default values rõ ràng
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private _settings$ = new BehaviorSubject<AppSettings>(this.loadFromStorage());

  /** Observable để subscribe — component tự động cập nhật khi settings thay đổi */
  readonly settings$: Observable<AppSettings> = this._settings$.asObservable();

  constructor(private supabaseService: SupabaseService) {
    // Tự động gọi Supabase lấy tỷ giá thực tế khi khởi động App
    this.syncLiveExchangeRate();
  }

  /** Snapshot hiện tại — dùng khi cần giá trị tức thì mà không cần subscribe */
  get snapshot(): AppSettings {
    return this._settings$.getValue();
  }

  /**
   * Cập nhật một phần settings và save
   */
  update(partial: Partial<AppSettings>): void {
    const updated: AppSettings = { ...this._settings$.getValue(), ...partial };
    this._settings$.next(updated);
    this.saveToStorage(updated);
  }

  /**
   * Reset về giá trị mặc định
   */
  reset(): void {
    this._settings$.next({ ...DEFAULT_SETTINGS });
    this.saveToStorage(DEFAULT_SETTINGS);
  }

  /**
   * Tính phí vận chuyển / SP từ shippingFeePerKg × defaultWeightKg
   */
  getShippingPerUnit(): number {
    const s = this.snapshot;
    return s.shippingFeePerKg * s.defaultWeightKg;
  }

  /**
   * Tỷ giá cho một currency cụ thể
   * CNY dùng exchangeRateManual, còn lại dùng default hardcode
   */
  getExchangeRate(currency: string): number {
    switch (currency) {
      case 'CNY': return this.snapshot.exchangeRateManual;
      case 'USD': return 25400;
      case 'VND': return 1;
      case 'KHR': return 6.2;
      default:    return this.snapshot.exchangeRateManual;
    }
  }

  /**
   * Đồng bộ tỷ giá CNY/VND từ Supabase database.
   * ★ Throttling: Chỉ gọi API nếu lần cuối cách đây > 1 tiếng
   */
  async syncLiveExchangeRate(): Promise<void> {
    const ONE_HOUR = 60 * 60 * 1000;
    const now = Date.now();
    const lastSync = this.snapshot.lastSyncTimestamp || 0;

    // Nếu vừa mới đồng bộ trong vòng 1 tiếng, bỏ qua để tiết kiệm tài nguyên
    if (now - lastSync < ONE_HOUR) {
      console.log('🕒 Tỷ giá vừa được đồng bộ gần đây, bỏ qua lượt này.');
      return;
    }

    try {
      const supabase = this.supabaseService.getClient();
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('rate')
        .eq('pair', 'CNY/VND')
        .single();

      if (!error && data?.rate) {
        // Cập nhật tỷ giá hệ thống và cập nhật luôn timestamp đồng bộ
        this.update({ 
          exchangeRateManual: data.rate,
          lastSyncTimestamp: now 
        });
        console.log(`✅ Đã đồng bộ tỷ giá Tệ trực tiếp từ DB: 1 CNY = ${data.rate} VND`);
      }
    } catch (err) {
      console.warn('⚠️ Không thể đồng bộ tỷ giá API:', err);
    }
  }

  // ======= Private helpers =======

  private loadFromStorage(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }

      // Migrate từ key cũ (trading_settings) nếu có và chưa có key mới
      const legacy = localStorage.getItem('trading_settings');
      if (legacy) {
        const old = JSON.parse(legacy);
        const migrated = {
          vatPercent:         old.tax_rate          ?? DEFAULT_SETTINGS.vatPercent,
          shippingFeePerKg:   old.shipping_fee_per_kg ?? DEFAULT_SETTINGS.shippingFeePerKg,
          exchangeRateManual: old.exchange_rate      ?? DEFAULT_SETTINGS.exchangeRateManual,
          defaultWeightKg:    old.default_weight_kg  ?? DEFAULT_SETTINGS.defaultWeightKg,
          serviceFeeRate:     old.service_fee_rate   ?? DEFAULT_SETTINGS.serviceFeeRate,
        };
        this.saveToStorage(migrated);
        return migrated;
      }
    } catch {
      // Parse error → dùng default
    }
    return { ...DEFAULT_SETTINGS };
  }

  private saveToStorage(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
}
