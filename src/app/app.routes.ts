import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {
    path: 'landing',
    loadComponent: () =>
      import(
        './features/landing/components/landing-page/landing-page.component'
      ).then((m) => m.LandingPageComponent),
  },
  {
    path: 'products',
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/products/components/product-list/product-list.component'
          ).then((m) => m.ProductListComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            './features/products/components/product-detail/product-detail.component'
          ).then((m) => m.ProductDetailComponent),
      },
    ],
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/cart/components/cart-list/cart-list.component').then(
        (m) => m.CartListComponent
      ),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/orders/components/order-list/order-list.component'
          ).then((m) => m.OrderListComponent),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import(
            './features/orders/components/checkout/checkout.component'
          ).then((m) => m.CheckoutComponent),
      },
    ],
  },
  {
    path: 'user',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/user/components/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/user/components/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/user/components/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
    ],
  },
  {
    path: 'payments',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/payments/components/payment/payment.component').then(
        (m) => m.PaymentComponent
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
