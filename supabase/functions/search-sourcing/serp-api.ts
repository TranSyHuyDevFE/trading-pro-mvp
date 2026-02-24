/**
 * SerpApi Module
 * Gọi Google Search để lấy link sản phẩm từ 1688.com
 */

const SERPAPI_KEY = Deno.env.get('SERPAPI_KEY') || '';

interface SearchResult {
  link: string;
  title: string;
  snippet: string;
}

/**
 * Tìm kiếm Google thông qua SerpApi
 * @param keyword - Từ khóa sản phẩm
 * @returns Danh sách URL kết quả từ 1688.com
 */
export async function searchGoogle(keyword: string): Promise<string[]> {
  // Tạo query tìm kiếm trên 1688
  const query = `site:1688.com ${keyword}`;

  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
    query
  )}&api_key=${SERPAPI_KEY}&num=10&hl=zh-CN`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.organic_results) {
      console.warn('SerpApi: Không có kết quả organic');
      return [];
    }

    // Lọc chỉ lấy link 1688.com
    const links = data.organic_results
      .filter((result: SearchResult) => result.link.includes('1688.com'))
      .map((result: SearchResult) => result.link);

    return links;
  } catch (error) {
    console.error('SerpApi Error:', error);
    throw new Error(`Lỗi gọi SerpApi: ${error.message}`);
  }
}
