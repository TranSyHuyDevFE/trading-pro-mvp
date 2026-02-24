import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiSourcingService, VendorResult, VendorCountry } from '../../core/services/ai-sourcing.service';
import { LoadingOverlayComponent } from '../../shared/components/loading-overlay/loading-overlay.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { VendorCardComponent } from './components/vendor-card/vendor-card.component';
import { CostCalculatorComponent } from './components/cost-calculator/cost-calculator.component';
import { MOCK_VENDORS } from './mock-vendors.data';

/**
 * SourcingPage - TAB 1: TÌM HÀNG & TÍNH GIÁ
 * Trang chính cho việc tìm kiếm xưởng cung cấp hàng
 */
@Component({
  selector: 'app-sourcing',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    LoadingOverlayComponent,
    EmptyStateComponent,
    VendorCardComponent,
    CostCalculatorComponent,
  ],
  templateUrl: './sourcing.page.html',
  styleUrls: ['./sourcing.page.scss'],
})
export class SourcingPage implements OnInit {
  searchKeyword = '';
  vendors: VendorResult[] = [];
  filteredVendors: VendorResult[] = [];
  isLoading = false;
  hasSearched = false;
  selectedVendor: VendorResult | null = null;
  showCalculator = false;
  // Filter số lượng kết quả: 5, 10, 15, 20 ... 50
  maxResults = 10;
  resultOptions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

  // ★ Filter quốc gia
  selectedCountry: 'ALL' | VendorCountry = 'ALL';
  countryOptions = [
    { value: 'ALL' as const, label: 'Tất cả', flag: '🌏' },
    { value: 'VN' as VendorCountry, label: 'Việt Nam', flag: '🇻🇳' },
    { value: 'TQ' as VendorCountry, label: 'Trung Quốc', flag: '🇨🇳' },
    { value: 'KH' as VendorCountry, label: 'Campuchia', flag: '🇰🇭' },
  ];

  // ★ Sắp xếp theo giá
  sortOrder: 'none' | 'asc' | 'desc' = 'none';

  constructor(private aiSourcingService: AiSourcingService) {}

  ngOnInit(): void {
    this.loadMockData();
  }

  /**
   * Load mock data để demo UI
   */
  private loadMockData(): void {
    this.hasSearched = true;
    this.vendors = MOCK_VENDORS.slice(0, this.maxResults);
    this.searchKeyword = 'túi xách nữ';
    this.applyFiltersAndSort();
  }

  /**
   * Thực hiện tìm kiếm xưởng
   */
  async onSearch(): Promise<void> {
    if (!this.searchKeyword.trim()) {
      return;
    }

    this.isLoading = true;
    this.hasSearched = true;
    this.selectedCountry = 'ALL'; // Reset filter khi tìm mới
    this.sortOrder = 'none';      // Reset sắp xếp

    setTimeout(() => {
      this.vendors = MOCK_VENDORS.slice(0, this.maxResults);
      this.applyFiltersAndSort();
      this.isLoading = false;
    }, 1500);
  }

  /**
   * ★ Filter theo quốc gia - click là filter ngay
   */
  filterByCountry(country: 'ALL' | VendorCountry): void {
    this.selectedCountry = country;
    this.applyFiltersAndSort();
  }

  /**
   * ★ Sắp xếp theo giá
   */
  onSortChange(event: any): void {
    this.sortOrder = event.detail.value;
    this.applyFiltersAndSort();
  }

  /**
   * Apply filter quốc gia và sắp xếp lên danh sách vendors
   */
  private applyFiltersAndSort(): void {
    // 1. Filter quốc gia
    let result = [];
    if (this.selectedCountry === 'ALL') {
      result = [...this.vendors];
    } else {
      result = this.vendors.filter(
        (v) => v.country === this.selectedCountry
      );
    }

    // 2. Sắp xếp theo giá (quy đổi VND để so sánh chính xác)
    if (this.sortOrder !== 'none') {
      const exchangeRates: Record<string, number> = {
        'CNY': 3500,
        'USD': 25500,
        'VND': 1,
        'KHR': 6.2
      };

      result.sort((a, b) => {
        const priceA = a.price * (exchangeRates[a.currency] || 1);
        const priceB = b.price * (exchangeRates[b.currency] || 1);
        
        return this.sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    this.filteredVendors = result;
  }

  /**
   * Đếm số xưởng theo quốc gia (hiển thị trên chip)
   */
  getCountryCount(country: string): number {
    return this.vendors.filter((v) => v.country === country).length;
  }

  /**
   * ★ Reset toàn bộ — xóa input và kết quả
   */
  resetSearch(): void {
    this.searchKeyword = '';
    this.vendors = [];
    this.filteredVendors = [];
    this.hasSearched = false;
    this.selectedCountry = 'ALL';
    this.showCalculator = false;
    this.selectedVendor = null;
  }

  /**
   * Mở bảng tính giá cho vendor được chọn
   */
  openCalculator(vendor: VendorResult): void {
    this.selectedVendor = vendor;
    this.showCalculator = true;
  }

  /**
   * Đóng bảng tính giá
   */
  closeCalculator(): void {
    this.showCalculator = false;
    this.selectedVendor = null;
  }
}
