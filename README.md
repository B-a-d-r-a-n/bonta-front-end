# Boon E-commerce Frontend

A modern Angular 20 e-commerce application built with TanStack Query, NgRx SignalStore, PrimeNG, and Tailwind CSS.

## 🚀 Features

- **Angular 20** with zoneless change detection for optimal performance
- **TanStack Query** for server state management and caching
- **NgRx SignalStore** for complex client-side state (checkout, filters)
- **Angular Signals** for component-specific UI state
- **PrimeNG** components with Tailwind CSS styling
- **Feature-based architecture** for scalable development
- **Accessibility** compliant with WCAG 2.2 guidelines
- **Responsive design** with mobile-first approach

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                          # Global utilities and models
│   │   ├── guards/                    # Route guards (e.g., auth guard)
│   │   ├── interceptors/              # HTTP interceptors (e.g., auth token)
│   │   ├── models/                    # TypeScript interfaces
│   │   ├── services/                  # Global services
│   │   ├── constants/                 # App-wide constants
│   │   └── enums/                     # TypeScript enums
│   ├── features/                      # Feature modules
│   │   ├── products/                  # Product-related functionality
│   │   │   ├── components/            # Standalone components
│   │   │   ├── queries/               # TanStack Query logic
│   │   │   └── store/                 # NgRx SignalStore for product filters
│   │   ├── cart/                      # Cart-related functionality
│   │   ├── orders/                    # Order-related functionality
│   │   ├── user/                      # User-related functionality
│   │   └── payments/                  # Payment-related functionality
│   └── shared/                        # Shared utilities and components
│       ├── components/                # PrimeNG wrappers
│       ├── layouts/                   # Layout components
│       ├── pipes/                     # Custom pipes
│       └── utils/                     # Utility functions
├── assets/                            # Static assets
├── styles/                            # Global Tailwind CSS
└── environments/                      # Environment configs
```

## 🛠️ Technology Stack

### Core Framework

- **Angular 20** - Latest version with standalone components
- **TypeScript 5.5+** - Strict mode enabled
- **Zoneless Change Detection** - For better performance

### State Management

- **TanStack Query v5** - Server state management and caching
- **NgRx SignalStore v19.2.1** - Complex client-side state
- **Angular Signals** - Component-specific UI state

### UI/UX

- **PrimeNG v20** - UI component library
- **Tailwind CSS v4.1** - Utility-first CSS framework
- **Accessibility** - WCAG 2.2 AA compliance

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **Cypress/Playwright** - E2E testing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Angular CLI 20

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd boon-front-end
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install additional packages** (when needed)

   ```bash
   # TanStack Query
   npm install @tanstack/angular-query

   # NgRx SignalStore
   npm install @ngrx/signals

   # PrimeNG
   npm install primeng primeicons

   # Tailwind CSS
   npm install -D tailwindcss postcss autoprefixer
   ```

4. **Start development server**

   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📋 API Integration

The application integrates with a .NET e-commerce API with the following endpoints:

### Authentication (`/api/Authentication`)

- `POST /login` - User login
- `POST /register` - User registration
- `GET /emailExists` - Check email availability
- `GET /currentUser` - Get current user
- `GET /address` - Get user address
- `PUT /address` - Update user address

### Baskets (`/api/Baskets`)

- `GET /` - Get user basket
- `POST /` - Add item to basket
- `PUT /` - Update basket item
- `DELETE /` - Remove item from basket

### Orders (`/api/Orders`)

- `POST /` - Create order
- `GET /` - Get user orders
- `GET /deliveryMethods` - Get delivery methods

### Payments (`/api/Payments`)

- `POST /{basketId}` - Create payment intent
- `POST /WebHook` - Payment webhook

### Products (`/api/Products`)

- `GET /` - Get paginated products
- `GET /{id}` - Get single product
- `GET /brands` - Get product brands
- `GET /types` - Get product types

## 🏗️ Architecture Patterns

### State Management Strategy

- **TanStack Query**: Server state (products, cart, orders)
- **NgRx SignalStore**: Complex client state (checkout flow, filters)
- **Signals**: Component-specific UI state (loading, form state)

### Component Architecture

- **Standalone Components**: All components are standalone
- **Feature-based Structure**: Organized by business features
- **Shared Components**: Reusable UI components

### Error Handling

- **Global Error Interceptor**: HTTP error handling
- **Toast Notifications**: User feedback
- **Form Validation**: Client-side validation

## 🧪 Testing Strategy

### Unit Testing

- **Jest** for components, services, and utilities
- **Mock Query Client** for TanStack Query testing
- **Mock SignalStore** for NgRx SignalStore testing
- **Accessibility Testing** with axe-core

### Integration Testing

- Component interactions with TanStack Query
- NgRx SignalStore state changes and methods
- API integration with mock backends

### E2E Testing

- **Cypress/Playwright** for user journey testing
- Critical paths: login, add to cart, checkout
- Responsive design testing

## 📱 Responsive Design

The application follows a mobile-first approach with Tailwind CSS breakpoints:

- **Mobile**: Default styles
- **Tablet**: `sm:` prefix (640px+)
- **Desktop**: `md:` prefix (768px+)
- **Large Desktop**: `lg:` prefix (1024px+)

## ♿ Accessibility

- **WCAG 2.2 AA** compliance
- **ARIA attributes** for screen readers
- **Keyboard navigation** support
- **Focus management** for better UX
- **Color contrast** ratios maintained

## 🔧 Development Workflow

### Code Style

- **Angular Style Guide** compliance
- **ESLint** with `@angular-eslint` rules
- **Prettier** for consistent formatting
- **Conventional Commits** for git messages

### Git Workflow

- **GitFlow** branching strategy
- **Feature branches** for new development
- **Pull request reviews** with automated checks

### CI/CD Pipeline

- Automated testing and linting
- Build and deploy to staging
- Accessibility testing with axe-core

## 📦 Build Configuration

### Development

```bash
npm start          # Start dev server
npm run build      # Build for production
npm run test       # Run unit tests
npm run e2e        # Run E2E tests
npm run lint       # Run ESLint
npm run format     # Run Prettier
```

### Environment Configuration

- `environment.ts` - Development settings
- `environment.prod.ts` - Production settings

## 🚀 Performance Optimization

- **Zoneless Change Detection** for better performance
- **Lazy Loading** for route-level and component-level code splitting
- **TanStack Query Caching** with appropriate stale times
- **Image Optimization** with lazy loading
- **Bundle Splitting** by feature and vendor libraries

## 🔒 Security

- **JWT Token** authentication
- **HTTP Interceptors** for secure API calls
- **Input Sanitization** to prevent XSS
- **Content Security Policy** headers
- **HTTPS** enforcement in production

## 📈 Monitoring & Analytics

- **Error Tracking** with global error interceptor
- **Performance Monitoring** with Angular DevTools
- **User Analytics** (to be implemented)
- **A/B Testing** capabilities (to be implemented)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**Built with ❤️ using Angular 20, TanStack Query, NgRx SignalStore, and PrimeNG**
