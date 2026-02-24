/**
 * Cấu hình CORS cho Edge Functions
 * Cho phép App Ionic gọi API mà không bị chặn
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

/**
 * Xử lý preflight OPTIONS request
 * Trả về 200 OK với CORS headers
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}
