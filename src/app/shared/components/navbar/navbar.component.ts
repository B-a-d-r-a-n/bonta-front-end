import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { BadgeModule } from 'primeng/badge';
import { MenuItem } from 'primeng/api';
import { DrawerModule } from 'primeng/drawer';

// Core & Shared Imports
import { AuthService } from '@core/services/auth.service';
import { CartDataService } from '@features/cart/services/cart-data.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    TieredMenuModule,
    BadgeModule,
    DrawerModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartDataService);

  sidebarVisible = signal(false);

  categories = [
    { label: 'Electronics', typeId: 1, icon: 'pi pi-headphones' },
    { label: 'Fashion', typeId: 2, icon: 'pi pi-user' },
    { label: 'Home', typeId: 3, icon: 'pi pi-home' },
    { label: 'Books', typeId: 7, icon: 'pi pi-book' },
  ];

  userMenuItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user', routerLink: '/user/profile' },
    { label: 'My Orders', icon: 'pi pi-shopping-bag', routerLink: '/orders' },
    { separator: true },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.authService.logout(),
    },
  ];
}
