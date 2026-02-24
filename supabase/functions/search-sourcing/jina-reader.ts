/**
 * Jina Reader Module
 * Lột HTML thành Markdown sạch để AI dễ phân tích
 * Sử dụng Jina AI Reader API (r.jina.ai)
 */

const JINA_API_KEY = Deno.env.get('JINA_API_KEY') || '';

/**
 * Extract nội dung từ URL thành Markdown sạch
 * @param url - URL trang web cần extract
 * @returns Nội dung Markdown sạch
 */
export async function extractContent(url: string): Promise<string> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;

    const response = await fetch(jinaUrl, {
      headers: {
        Accept: 'text/markdown',
        Authorization: `Bearer ${JINA_API_KEY}`,
        'X-Return-Format': 'markdown',
      },
    });

    if (!response.ok) {
      console.warn(`Jina Reader: Lỗi ${response.status} cho ${url}`);
      return '';
    }

    const markdown = await response.text();

    // Giới hạn độ dài để không vượt quá token limit của Gemini
    const maxLength = 5000;
    return markdown.length > maxLength
      ? markdown.substring(0, maxLength) + '\n...[Đã cắt bớt]'
      : markdown;
  } catch (error) {
    console.error(`Jina Reader Error cho ${url}:`, error);
    return '';
  }
}
