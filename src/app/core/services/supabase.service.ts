import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * SupabaseService - Khởi tạo và quản lý kết nối Database
 * Singleton Service - dùng chung toàn App
 */
@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  /**
   * Lấy instance SupabaseClient để sử dụng ở các Service khác
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Gọi Edge Function trên Supabase
   * @param functionName - Tên Edge Function (ví dụ: 'search-sourcing')
   * @param body - Dữ liệu gửi lên
   */
  async invokeFunction(functionName: string, body: any): Promise<any> {
    const { data, error } = await this.supabase.functions.invoke(functionName, {
      body,
    });

    if (error) {
      console.error(`Error calling ${functionName}:`, error);
      throw error;
    }

    return data;
  }
}
