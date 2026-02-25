import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'sourcing',
        loadComponent: () =>
          import('../features/sourcing/sourcing.page').then(
            (m) => m.SourcingPage
          ),
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('../features/audit/audit.page').then((m) => m.AuditPage),
      },

      {
        path: '',
        redirectTo: '/tabs/sourcing',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/sourcing',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
