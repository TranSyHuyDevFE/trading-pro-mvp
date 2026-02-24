import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

/**
 * Loại hình liên lạc xưởng
 */
export type ContactType = 'wechat' | 'zalo' | 'phone';

/**
 * Quốc gia xưởng
 */
export type VendorCountry = 'VN' | 'TQ' | 'KH';

/**
 * Đơn vị tiền tệ
 */
export type VendorCurrency = 'CNY' | 'VND' | 'USD' | 'KHR';

/**
 * Kết quả tìm kiếm xưởng từ AI
 */
export interface VendorResult {
  name: string;              // Tên xưởng / shop
  url: string;               // Link trang sản phẩm
  price: number;             // Giá gốc (theo currency)
  currency: VendorCurrency;  // Đơn vị tiền tệ
  moq: number;               // Số lượng đặt tối thiểu
  rating: number;            // Đánh giá (1-5)
  years_on_platform: number; // Số năm hoạt động
  location: string;          // Vị trí xưởng
  phone: string;             // Số điện thoại / ID liên hệ
  contact_type: ContactType; // Loại liên hệ: Wechat / Zalo / Phone
  country: VendorCountry;    // Quốc gia: VN, TQ, KH
  image_url?: string;        // Link ảnh sản phẩm
  description?: string;      // Mô tả ngắn
}

/**
 * AiSourcingService - Gọi API tìm hàng thông qua Edge Function
 * Xử lý toàn bộ quy trình: Search → Lột HTML → AI phân tích
 */
@Injectable({
  providedIn: 'root',
})
export class AiSourcingService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Tìm kiếm xưởng cung cấp hàng
   * @param keyword - Từ khóa sản phẩm (tiếng Việt hoặc tiếng Trung)
   * @param options - Tùy chọn bổ sung (số lượng kết quả, bộ lọc...)
   */
  async searchVendors(
    keyword: string,
    options?: { maxResults?: number; minRating?: number }
  ): Promise<VendorResult[]> {
    try {
      const response = await this.supabaseService.invokeFunction(
        'search-sourcing',
        {
          keyword,
          max_results: options?.maxResults || 10,
          min_rating: options?.minRating || 0,
        }
      );

      return response.vendors || [];
    } catch (error) {
      console.error('Lỗi khi tìm kiếm xưởng:', error);
      throw error;
    }
  }
}
