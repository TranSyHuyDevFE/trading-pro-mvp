import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

/**
 * Edge Function: update-rates
 * Task 3: Lấy tỷ giá mới nhất và ghi vào database
 */
serve(async (req: Request) => {
  // 1. Xử lý CORS cho phép frontend gọi từ xa
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    console.log('📊 Bắt đầu cập nhật tỷ giá CNY/VND...');

    // 2. Gọi API ngoài (exchangerate-api.com là Public API miễn phí)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/CNY');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const rateVND = data.rates?.VND;

    if (!rateVND) {
      throw new Error('Dữ liệu không chứa tỷ giá VND');
    }

    console.log(`✅ Tỷ giá API báo về: 1 CNY = ${rateVND} VND`);

    // 3. Khởi tạo Supabase Client bằng quyền admin (Service Role Key)
    // Các biến môi trường này tự động có sẵn khi chạy trên Supabase hoặc start local
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 4. Ghi đè vào bảng exchange_rates (Upsert)
    const { error: dbError } = await supabase
      .from('exchange_rates')
      .upsert({
        pair: 'CNY/VND',
        rate: rateVND,
        provider: 'exchangerate-api'
      }, {
        onConflict: 'pair' // Báo cho Supabase biết nếu trùng pair thì update
      });

    if (dbError) {
      throw new Error(`Lỗi cập nhật Database: ${dbError.message}`);
    }

    console.log('💾 Đã lưu tỷ giá vào Database thành công!');

    // 5. Trả về kết quả cho frontend
    return new Response(
      JSON.stringify({
        success: true,
        pair: 'CNY/VND',
        rate: rateVND,
        message: 'Đã cập nhật tỷ giá thành công'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('❌ Lỗi:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
