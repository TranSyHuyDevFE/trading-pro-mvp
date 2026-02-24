import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

/**
 * AuditPage - TAB 2: SOI PHỐT & UY TÍN
 * Kiểm tra độ uy tín của xưởng/shop trên 1688
 * (Giai đoạn phát triển sau)
 */
@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [IonicModule, CommonModule, EmptyStateComponent],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>🔎 Kiểm Định</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <app-empty-state
        icon="shield-checkmark-outline"
        title="Tính năng đang phát triển"
        description="Chức năng kiểm tra uy tín xưởng sẽ được cập nhật trong phiên bản tiếp theo"
      ></app-empty-state>
    </ion-content>
  `,
})
export class AuditPage {}
