import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

/**
 * AuthGuard - Kiểm tra đăng nhập trước khi vào trang
 * (Dành cho giai đoạn sau khi cần đăng nhập)
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    // TODO: Kiểm tra trạng thái đăng nhập từ Supabase Auth
    // Hiện tại cho phép truy cập tất cả (MVP)
    const isAuthenticated = true;

    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
