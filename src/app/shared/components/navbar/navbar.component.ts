import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { BadgeModule } from 'primeng/badge';
import { MenuItem } from 'primeng/api';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { CartQueries } from '../../../features/cart/queries/cart.queries';
import { AuthService } from '@core/services/auth.service';
import { StorageUtils } from '@shared/utils/storage.utils';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { BasketItemDTO } from '@core/models';
import { DrawerModule } from 'primeng/drawer';
import { UserResponse } from '@core/models/user.model';
import { CartStore } from '@features/cart/store/cart.store';
import { CartDataService } from '@features/cart/services/cart-data.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [
    RouterLink,
    DrawerModule,
    RouterLinkActive,
    ButtonModule,
    TieredMenuModule,
    BadgeModule,
  ],
})
export class NavbarComponent {
  readonly cartService = inject(CartDataService);
  private authService = inject(AuthService);

  sidebarVisible = signal(false);

  isAuthenticated = computed(() => this.authService.isAuthenticated());
  currentUser = computed(() => {
    if (this.authService.isLoggedIn()) {
      return StorageUtils.getLocalItem<UserResponse>(STORAGE_KEYS.CURRENT_USER);
    }
    return null;
  });

  userMenuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      routerLink: '/user/profile',
    },
    {
      label: 'My Orders',
      icon: 'pi pi-shopping-bag',
      routerLink: '/orders',
    },
    {
      separator: true,
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  logout(): void {
    this.authService.logout();
  }
}
