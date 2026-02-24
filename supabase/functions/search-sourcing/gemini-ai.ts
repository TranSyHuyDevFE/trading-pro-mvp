/**
 * Gemini AI Module
 * Gọi Google Gemini để phân tích nội dung và trích xuất thông tin xưởng
 */

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const GEMINI_MODEL = 'gemini-2.0-flash';

/**
 * System Prompt cho Gemini
 * Hướng dẫn AI cách phân tích và trích xuất thông tin từ trang 1688
 */
const SYSTEM_PROMPT = `Bạn là một chuyên gia phân tích thị trường hàng hóa Trung Quốc.
Nhiệm vụ: Phân tích nội dung từ các trang 1688.com và trích xuất thông tin xưởng/shop.

Với mỗi xưởng tìm được, trả về JSON array với format:
[
  {
    "name": "Tên xưởng/shop",
    "url": "Link gốc trên 1688",
    "price_cny": 25.5,
    "moq": 100,
    "rating": 4.5,
    "years_on_platform": 3,
    "location": "Quảng Châu, Quảng Đông",
    "description": "Mô tả ngắn gọn về sản phẩm và xưởng"
  }
]

Quy tắc:
- Giá (price_cny) phải là số, đơn vị CNY
- MOQ (Minimum Order Quantity) nếu không rõ thì để 1
- Rating từ 1-5, nếu không có thì để 3
- Ưu tiên các xưởng có rating cao và hoạt động lâu năm
- Chỉ trả về JSON array, không giải thích thêm
- Tối đa 10 xưởng
`;

/**
 * Gọi Gemini AI để phân tích nội dung
 * @param keyword - Từ khóa tìm kiếm gốc
 * @param contents - Mảng nội dung Markdown từ các trang 1688
 * @returns Danh sách thông tin xưởng đã phân tích
 */
export async function analyzeWithGemini(
  keyword: string,
  contents: string[]
): Promise<any[]> {
  const validContents = contents.filter((c) => c.trim().length > 0);

  if (validContents.length === 0) {
    console.warn('Gemini: Không có nội dung để phân tích');
    return [];
  }

  const userPrompt = `Từ khóa tìm kiếm: "${keyword}"

Nội dung từ các trang 1688:
${validContents.map((c, i) => `--- TRANG ${i + 1} ---\n${c}`).join('\n\n')}

Hãy phân tích và trả về danh sách xưởng theo format JSON.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    });

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      console.warn('Gemini: Response không hợp lệ', data);
      return [];
    }

    const text = data.candidates[0].content.parts[0].text;
    const vendors = JSON.parse(text);

    return Array.isArray(vendors) ? vendors : [];
  } catch (error) {
    console.error('Gemini Error:', error);
    throw new Error(`Lỗi gọi Gemini: ${error.message}`);
  }
}
