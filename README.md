# Bonta E-commerce Frontend

This repository contains the frontend for "Bonta," a modern e-commerce platform built with Angular. The application showcases a feature-rich, scalable, and performant online shopping experience.

## 🚀 Features

- **Modern Technology Stack**: Built on the latest Angular framework, utilizing modern tools and libraries for a high-quality development experience.
- **Comprehensive E-commerce Functionality**: Includes essential features like product listings, detailed product views, a shopping cart, and a complete checkout process with payment integration.
- **User Authentication**: Secure user registration and login functionality to manage profiles and track orders.
- **Responsive Design**: A mobile-first approach ensures a seamless experience across all devices, from desktops to smartphones.
- **State Management**: Utilizes robust state management solutions for predictable and maintainable application state.
- **Component-Based Architecture**: A modular and reusable component structure for easy maintenance and scalability.

## 📁 Project Structure

The project follows a feature-based architecture to promote scalability and separation of concerns.

```
src/
├── app/
│   ├── core/                          # Global services, models, guards, and interceptors
│   ├── features/                      # Feature modules for different business domains
│   │   ├── cart/                      # Shopping cart functionality
│   │   ├── orders/                    # Order management and checkout
│   │   ├── products/                  # Product browsing and details
│   │   └── user/                      # User authentication and profile
│   └── shared/                        # Reusable components, pipes, and utilities
├── assets/                            # Static assets like images and fonts
├── environments/                      # Environment-specific configurations
└── styles/                            # Global styles and themes
```

## 🛠️ Technology Stack

This project is built with a modern and powerful set of technologies:

- **Angular**: A leading frontend framework for building dynamic and single-page applications.
- **TypeScript**: A typed superset of JavaScript that enhances code quality and maintainability.
- **PrimeNG**: A rich set of UI components for Angular.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **NgRx (Signals)**: For reactive state management in Angular.
- **TanStack Query**: For data fetching, caching, and state synchronization.
- **Stripe**: For secure online payment processing.

## ⚙️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js ([download](https://nodejs.org/en/download/))
- Angular CLI: `npm install -g @angular/cli`

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/bonta-front-end.git
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd bonta-front-end
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

### Running the Application

Once the dependencies are installed, you can start the development server:

```bash
ng serve
```

The application will be available at `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## ✨ Available Scripts

In the project directory, you can run the following commands:

- `ng serve`: Starts the development server.
- `ng build`: Builds the project for production.
- `ng test`: Runs the unit tests.
- `ng lint`: Lints the project files.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/bonta-front-end/issues).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
