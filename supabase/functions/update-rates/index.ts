import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

/**
 * Edge Function: update-rates
 * CRON JOB: Cập nhật tỷ giá CNY/VND
 * Chạy ngầm lúc 6h sáng hàng ngày
 */
serve(async (req: Request) => {
  // Xử lý CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    console.log('📊 Bắt đầu cập nhật tỷ giá CNY/VND...');

    // Gọi API lấy tỷ giá (sử dụng exchangerate-api.com hoặc tương tự)
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/CNY'
    );
    const data = await response.json();

    const rate = data.rates?.VND;

    if (!rate) {
      throw new Error('Không lấy được tỷ giá VND');
    }

    console.log(`✅ Tỷ giá hiện tại: 1 CNY = ${rate} VND`);

    // TODO: Lưu vào database Supabase
    // const supabase = createClient(...)
    // await supabase.from('exchange_rates').insert({ rate, source: 'exchangerate-api' })

    return new Response(
      JSON.stringify({
        success: true,
        rate,
        updated_at: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Lỗi cập nhật tỷ giá:', error);
    return new Response(
      JSON.stringify({ error: 'Lỗi cập nhật tỷ giá', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
