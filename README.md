# Bonta E-commerce Frontend 🛍️

A hyper-modern, performant, and scalable e-commerce frontend built with **Angular 20 (Zoneless)**, **TanStack Query**, and **NgRx SignalStore**. This project serves as a blueprint for building next-generation, feature-rich web applications by combining the best of Angular's new reactive paradigm with proven state management patterns.

---

## 🚀 Key Highlights & Architectural Philosophy

This isn't just another e-commerce demo. Bonta is engineered from the ground up to be exceptionally performant, scalable, and a joy to develop.

- ⚡️ **Blazing Fast with Zoneless Angular:** By ditching Zone.js, we achieve fine-grained change detection and superior performance. The entire application is built on **Angular Signals**, ensuring the UI updates only when necessary.

- 🧠 **Intelligent State Management Strategy:** We've adopted a hybrid approach for optimal state handling:

  - **TanStack Query** masterfully handles all **server state**, eliminating complex boilerplate for data fetching, caching, and background synchronization.
  - **NgRx SignalStore** manages complex, shared **client state** (like the checkout flow or multi-faceted filters) with a simple, reactive, and boilerplate-free API.
  - **Local Component Signals** are used for simple UI state, keeping components self-contained and easy to reason about.

- 🧩 **Fully Standalone Architecture:** The entire application is built with **Standalone Components, Directives, and Pipes**. This modern approach simplifies the architecture, improves tree-shakability, and makes the codebase more modular and maintainable.

- 🎨 **Professionally Styled UI:** A combination of the rich **PrimeNG v20** component library and the utility-first power of **Tailwind CSS v4** allows for beautiful, consistent, and highly customizable user interfaces.

- ✅ **Built for Scale:** The feature-based project structure ensures that as the application grows, it remains organized and easy for teams to work on concurrently.

---

## 🛠️ Technology Stack

We've carefully selected a stack that represents the cutting edge of frontend development, prioritizing developer experience, performance, and long-term maintainability.

### Core Framework

| Technology      | Version   | Description                                                                                                   |
| :-------------- | :-------- | :------------------------------------------------------------------------------------------------------------ |
| **Angular**     | `~20.1.0` | The latest version of the framework, enabling zoneless architecture and a fully signal-based component model. |
| **TypeScript**  | `~5.8.2`  | Enforces strict type-safety across the entire codebase for enhanced reliability.                              |
| **Angular SSR** | `~20.0.5` | Enables Server-Side Rendering for improved SEO and initial load performance.                                  |

### State Management

| Technology           | Version   | Description                                                                                                                                                |
| :------------------- | :-------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TanStack Query**   | `~5.83.0` | The go-to library for managing server state. It simplifies fetching, caching, and synchronization, making the app feel faster and more responsive.         |
| **NgRx SignalStore** | `~20.0.0` | A reactive state management solution built on Angular Signals. Perfect for managing complex client-side state without the boilerplate of traditional NgRx. |
| **Angular Signals**  | `^20.0.0` | The core reactive primitive for all component-level UI state, ensuring optimal performance.                                                                |

### UI/UX

| Technology       | Version   | Description                                                                                                  |
| :--------------- | :-------- | :----------------------------------------------------------------------------------------------------------- |
| **PrimeNG**      | `~20.0.0` | A comprehensive suite of UI components that are fully integrated with the Angular ecosystem.                 |
| **Tailwind CSS** | `~4.1.11` | A utility-first CSS framework that allows for rapid development of custom designs without leaving your HTML. |
| **PrimeIcons**   | `^7.0.0`  | The official icon library for PrimeNG, providing a wide range of icons for a polished look.                  |
| **Aura Theme**   | `^1.2.1`  | A modern, clean, and highly customizable theme for PrimeNG components.                                       |

### Development & Tooling

| Technology         | Description                                                                                                |
| :----------------- | :--------------------------------------------------------------------------------------------------------- |
| **Angular CLI**    | The command-line interface for Angular, streamlining development tasks.                                    |
| **Vite / esbuild** | Used under the hood by the Angular CLI for lightning-fast server startup and builds.                       |
| **RxJS**           | Used for handling complex asynchronous operations and event streams where signals are not the primary fit. |

---

## 🏗️ Architectural Patterns

The architecture is designed to be robust and scalable, adhering to modern best practices.

### State Management Strategy

- **Server State (TanStack Query):** All data fetched from the API (products, orders, user profile) is managed by TanStack Query. This provides automatic caching, background refetching, and optimistic updates out of the box.
- **Shared Client State (NgRx SignalStore):** State that needs to be shared across multiple components but doesn't come from the server is handled by SignalStore. A prime example is the `CheckoutStore`, which manages the multi-step checkout process.
- **Local UI State (Angular Signals):** Any state that is local to a single component (e.g., `isLoading`, `isMenuVisible`) is managed using `signal()`, keeping components simple and self-contained.

### Component Architecture

- **100% Standalone Components:** Every component, directive, and pipe is standalone, eliminating the need for `NgModule`. This simplifies the mental model and improves code-splitting.
- **Feature-Based Module Structure:** Code is organized by business domain (e.g., `products`, `cart`, `orders`), making it easy to locate relevant files and understand the application's structure.
- **Smart vs. Presentational Components:** The application uses a mix of smart (container) components that manage state and logic, and presentational (dumb) components that are only responsible for the UI.

### Asynchronous Operations

- **Async/Await with `lastValueFrom`:** Used for simple, single-emission HTTP requests within services or mutations.
- **Observables (RxJS):** Employed for handling complex asynchronous events, such as real-time updates or debouncing user input in search fields.

---

## 🚀 Getting Started

Get a local copy up and running in minutes.

### Prerequisites

- Node.js v18+
- Angular CLI v20+

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <your-repo-url>
    cd bonta-front-end
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:4200/`.
