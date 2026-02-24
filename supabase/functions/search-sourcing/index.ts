import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { searchGoogle } from './serp-api.ts';
import { extractContent } from './jina-reader.ts';
import { analyzeWithGemini } from './gemini-ai.ts';

/**
 * Edge Function: search-sourcing
 * API CHÍNH: Xử lý quy trình quét hàng
 *
 * Quy trình:
 * 1. Nhận từ khóa từ App Ionic
 * 2. Gọi SerpApi để search Google lấy link 1688
 * 3. Gọi Jina Reader để lột HTML thành Markdown sạch
 * 4. Gọi Gemini AI để phân tích và trích xuất thông tin xưởng
 * 5. Trả kết quả về cho App
 */
serve(async (req: Request) => {
  // Xử lý CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { keyword, max_results = 10, min_rating = 0 } = await req.json();

    if (!keyword) {
      return new Response(
        JSON.stringify({ error: 'Thiếu từ khóa tìm kiếm' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`🔍 Bắt đầu tìm kiếm: "${keyword}"`);

    // Bước 1: Tìm kiếm Google để lấy link 1688
    const searchResults = await searchGoogle(keyword);
    console.log(`✅ Tìm thấy ${searchResults.length} link từ Google`);

    // Bước 2: Lột HTML từ các link
    const contents = await Promise.all(
      searchResults.slice(0, 5).map((url: string) => extractContent(url))
    );
    console.log(`✅ Đã extract nội dung từ ${contents.length} trang`);

    // Bước 3: Phân tích bằng Gemini AI
    const vendors = await analyzeWithGemini(keyword, contents);
    console.log(`✅ Gemini trả về ${vendors.length} xưởng`);

    // Lọc theo rating nếu có
    const filteredVendors = vendors
      .filter((v: any) => v.rating >= min_rating)
      .slice(0, max_results);

    return new Response(
      JSON.stringify({ vendors: filteredVendors, total: filteredVendors.length }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Lỗi search-sourcing:', error);
    return new Response(
      JSON.stringify({ error: 'Lỗi xử lý yêu cầu', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
