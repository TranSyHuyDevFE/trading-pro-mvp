/**
 * Utility functions cho format tiền tệ
 */

/**
 * Format số tiền theo VND
 * @param amount - Số tiền cần format
 * @returns Chuỗi đã format (ví dụ: "1.234.567 ₫")
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format số tiền theo CNY
 * @param amount - Số tiền cần format
 * @returns Chuỗi đã format (ví dụ: "¥123.45")
 */
export function formatCNY(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(amount);
}

/**
 * Format số có dấu phân cách hàng nghìn
 * @param value - Số cần format
 * @returns Chuỗi đã format (ví dụ: "1.234.567")
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

/**
 * Parse chuỗi tiền tệ thành số
 * @param value - Chuỗi tiền tệ (ví dụ: "1.234.567")
 * @returns Số (ví dụ: 1234567)
 */
export function parseCurrency(value: string): number {
  return Number(value.replace(/[^0-9.-]+/g, ''));
}
