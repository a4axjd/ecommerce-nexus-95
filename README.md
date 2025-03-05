# Modern E-commerce Store - Complete Project Guide

This project is a full-featured e-commerce web application built with modern web technologies. This guide provides a comprehensive overview of the project structure, components, and functionality to help you understand and modify the codebase, even if you have no prior knowledge of the project.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Core Technologies](#core-technologies)
5. [Pages](#pages)
6. [Components](#components)
7. [Context Providers](#context-providers)
8. [Hooks](#hooks)
9. [Utilities](#utilities)
10. [Firebase Integration](#firebase-integration)
11. [Stripe Integration](#stripe-integration)
12. [Authentication](#authentication)
13. [Theming and Styling](#theming-and-styling)
14. [Editing Guidelines](#editing-guidelines)
15. [Common Tasks](#common-tasks)
16. [Troubleshooting](#troubleshooting)
17. [Payment Processors](#payment-processors)
18. [Store Settings](#store-settings)

## Project Overview

This e-commerce application provides a complete shopping experience with the following key features:

- Product browsing with category filtering and searching
- Product detail pages with variations (colors, sizes)
- Shopping cart functionality
- User authentication (sign-up/sign-in)
- Checkout process with payment integration
- Order confirmation and history
- Admin dashboard for product, order, and content management
- Blog section for content marketing
- Analytics tracking
- Responsive design for all devices

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start the development server
npm run dev
```

### Alternative Editing Methods

**Edit directly in GitHub:**
- Navigate to the desired file
- Click the "Edit" button (pencil icon)
- Make changes and commit

**Use GitHub Codespaces:**
- Navigate to the main repository page
- Click on the "Code" button (green)
- Select the "Codespaces" tab
- Click "New codespace"

## Project Structure

The project follows a standard React application structure:

```
src/
  ├── components/       # Reusable UI components
  ├── context/          # React context providers
  ├── hooks/            # Custom React hooks
  ├── lib/              # Utility functions and libraries
  ├── pages/            # Page components for routing
  ├── main.tsx          # Application entry point
  ├── App.tsx           # Main application component with routing
  └── index.css         # Global styles
```

## Core Technologies

This project is built with:

- **Vite**: Fast build tool and development server
- **TypeScript**: Static typing for JavaScript
- **React**: UI component library
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Reusable component library
- **Firebase**: Backend-as-a-Service for data storage and authentication
- **Stripe**: Payment processing
- **TanStack Query**: Data fetching and state management
- **Sonner**: Toast notifications

## Pages

The application consists of the following pages:

### Customer-Facing Pages

1. **Index (`src/pages/Index.tsx`)**: 
   - The homepage/landing page of the application
   - Features hero section, featured products, categories, testimonials, and other marketing content
   - Displays recently viewed products if available

2. **Products (`src/pages/Products.tsx`)**: 
   - Lists all products with filtering and sorting options
   - Supports category filtering and search functionality
   - Products can be sorted by price and name

3. **ProductDetail (`src/pages/ProductDetail.tsx`)**: 
   - Displays detailed information about a specific product
   - Shows product variations (colors, sizes)
   - Allows adding products to cart with selected variations
   - Shows related products recommendations

4. **Checkout (`src/pages/Checkout.tsx`)**: 
   - Multi-step checkout process with shipping, billing, and payment information
   - Integrates with Stripe for payment processing
   - Validates user input before proceeding

5. **OrderConfirmation (`src/pages/OrderConfirmation.tsx`)**: 
   - Confirmation page after successful checkout
   - Displays order summary and tracking information
   - Provides options to continue shopping

6. **About (`src/pages/About.tsx`)**: 
   - Company information and story
   - Mission, vision, and values

7. **Contact (`src/pages/Contact.tsx`)**: 
   - Contact form and company contact information
   - Form validation and submission handling

8. **Blogs (`src/pages/Blogs.tsx`)**: 
   - Lists all blog posts with filtering options
   - Content marketing section

9. **BlogPost (`src/pages/BlogPost.tsx`)**: 
   - Detailed view of a specific blog post
   - Related posts and social sharing options

10. **UserAccount (`src/pages/UserAccount.tsx`)**: 
    - User profile management
    - Order history
    - Account settings

11. **SignIn (`src/pages/SignIn.tsx`)**: 
    - User authentication with email/password
    - Social login options

12. **SignUp (`src/pages/SignUp.tsx`)**: 
    - New user registration
    - Form validation

13. **NotFound (`src/pages/NotFound.tsx`)**: 
    - 404 error page for non-existent routes

### Admin Pages

1. **Admin (`src/pages/Admin.tsx`)**: 
   - Main admin dashboard
   - Overview of store performance
   - Quick access to all admin functions

2. **AdminSignIn (`src/pages/AdminSignIn.tsx`)**: 
   - Secure sign-in for admin users
   - Role-based authentication

3. **BlogAdmin (`src/pages/BlogAdmin.tsx`)**: 
   - Blog post management
   - Create, edit, delete blog posts

4. **OrdersAdmin (`src/pages/OrdersAdmin.tsx`)**: 
   - Order management and processing
   - Order status updates
   - Customer order history

5. **AnalyticsAdmin (`src/pages/AnalyticsAdmin.tsx`)**: 
   - Sales and traffic analytics
   - Customer behavior insights
   - Performance metrics

6. **CouponsAdmin (`src/pages/CouponsAdmin.tsx`)**: 
   - Discount and promotion management
   - Create, edit, delete coupon codes

## Components

The application uses numerous reusable components:

### UI Components

1. **Navbar (`src/components/Navbar.tsx`)**: 
   - Top navigation bar present on all pages
   - Contains logo, navigation links, search, cart, and user menu
   - Responsive design for mobile and desktop

2. **Footer (`src/components/Footer.tsx`)**: 
   - Page footer with links, social media, and company information
   - Present on all pages

3. **Cart (`src/components/Cart.tsx`)**: 
   - Shopping cart sidebar
   - Displays cart items, quantities, and totals
   - Coupon code functionality
   - Checkout and continue shopping options

4. **ProductCard (`src/components/ProductCard.tsx`)**: 
   - Card component for displaying product information in lists
   - Used on Products page and recommendations

5. **ProtectedRoute (`src/components/ProtectedRoute.tsx`)**: 
   - Route wrapper that restricts access to authenticated users
   - Used for admin pages and user account

6. **AdminSidebar (`src/components/AdminSidebar.tsx`)**: 
   - Navigation sidebar for admin pages
   - Links to all admin functions

7. **PaymentForm (`src/components/PaymentForm.tsx`)**: 
   - Stripe payment form integration
   - Handles credit card processing

### UI Library Components

The project uses shadcn/ui for consistent UI components:

- **Button**: `src/components/ui/button.tsx`
- **Card**: `src/components/ui/card.tsx`
- **Input**: `src/components/ui/input.tsx`
- **Sheet**: `src/components/ui/sheet.tsx`
- **Separator**: `src/components/ui/separator.tsx`
- **Dropdown Menu**: `src/components/ui/dropdown-menu.tsx`
- ... and many more UI components

## Context Providers

The application uses React Context for global state management:

1. **CartContext (`src/context/CartContext.tsx`)**: 
   - Manages shopping cart state
   - Functions for adding, removing, and updating cart items
   - Calculates totals and handles persistence

2. **AuthContext (`src/context/AuthContext.tsx`)**: 
   - Manages user authentication state
   - Sign-in, sign-up, and sign-out functionality
   - User profile information

## Hooks

Custom hooks provide reusable logic:

1. **useProducts (`src/hooks/useProducts.tsx`)**: 
   - Fetches product data from Firebase
   - Provides functions for product CRUD operations
   - Caches data with React Query

2. **useBlogs (`src/hooks/useBlogs.tsx`)**: 
   - Manages blog post data
   - Functions for creating and updating blog content

3. **useOrders (`src/hooks/useOrders.tsx`)**: 
   - Order creation and management
   - Order history retrieval

4. **useCoupons (`src/hooks/useCoupons.tsx`)**: 
   - Coupon code validation and application
   - Discount calculations

5. **useAnalytics (`src/hooks/useAnalytics.tsx`)**: 
   - Tracks user behavior and page visits
   - Provides analytics data for admin dashboard

6. **use-mobile (`src/hooks/use-mobile.tsx`)**: 
   - Responsive design helper for detecting mobile devices

7. **useStoreSettings (`src/hooks/useStoreSettings.tsx`)**:
   - Manages global store settings like currency and region
   - Provides functions for updating store settings
   - Used throughout the application for consistent formatting

## Utilities

Utility functions and configurations:

1. **Firebase (`src/lib/firebase.ts`)**: 
   - Firebase configuration and initialization
   - Database, authentication, and storage services

2. **Stripe (`src/lib/stripe.ts`)**: 
   - Stripe payment integration configuration

3. **Utils (`src/lib/utils.ts`)**: 
   - Common utility functions used throughout the app

4. **Notifications (`src/lib/notifications.ts`)**: 
   - Toast notification configuration and functions

5. **Store Settings (`src/lib/storeSettings.ts`)**:
   - Configuration for store currency and region settings
   - Functions for formatting prices according to store settings

## Firebase Integration

The project uses Firebase for backend services:

- **Authentication**: User sign-up, sign-in, and management
- **Firestore**: Database for products, orders, users, and blog posts
- **Storage**: Image and file storage

Key Firebase services are initialized in `src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

## Stripe Integration

Payment processing is handled through Stripe:

- Integrated in the checkout process
- Configured in `src/lib/stripe.ts`
- Uses `@stripe/react-stripe-js` for React components

## Payment Processors

The application supports multiple payment methods through the `PaymentForm` component:

### Available Payment Methods

1. **Credit Card**
   - Direct card input with validation
   - Configured in `src/components/PaymentForm.tsx`
   - Customizable styling and validation rules

2. **PayPal**
   - Integration using PayPal Express Checkout
   - Uses the `@paypal/react-paypal-js` package
   - Client ID configuration in `PaymentForm.tsx`

3. **Cash on Delivery (COD)**
   - Simple option for pay-on-delivery orders
   - No external integration required
   - Fully customizable messaging and instructions

### Adding or Editing Payment Methods

To modify existing payment methods or add new ones:

1. **Edit `src/components/PaymentForm.tsx`**:
   - Contains all payment processor implementations
   - Organized in tabs for each payment method
   - Each method has its own form and handling logic

2. **For adding a new payment method**:
   - Add a new tab in the `TabsList` component
   - Create a new `TabsContent` section with the form and logic
   - Update the `paymentMethod` state type to include your new method
   - Implement the handling function for the new payment method

3. **For modifying an existing payment method**:
   - Locate the relevant `TabsContent` section
   - Modify the form, styling, or logic as needed
   - Update validation rules if necessary

4. **Handling success and callbacks**:
   - All payment methods use the `onSuccess` prop to notify the parent component
   - The parent component (`Checkout.tsx`) handles the order creation

### Payment API Keys

For payment processors requiring API keys:

1. **Stripe**: 
   - Update the publishable key in `src/lib/stripe.ts`
   - Keep the secret key secure on your backend

2. **PayPal**: 
   - Update the client ID in the `PayPalScriptProvider` in `PaymentForm.tsx`
   - Configure additional parameters in the same component

3. **Other Processors**:
   - Add API keys and configuration to appropriate files
   - Follow security best practices for handling keys

## Authentication

User authentication flow:

1. Users can sign up via `SignUp.tsx`
2. Login is handled in `SignIn.tsx`
3. Authentication state is managed in `AuthContext.tsx`
4. Protected routes check authentication status before rendering

## Store Settings

The application includes global store settings that can be managed from the Admin dashboard:

1. **Currency Settings**:
   - Configure the currency used throughout the store
   - Set the currency symbol and its position (before or after amount)
   - Preview how prices will be displayed

2. **Region Settings**:
   - Set the country/region for your store
   - Automatically configures country codes and timezones
   - Affects shipping rules and tax calculations

3. **Implementation**:
   - Settings are stored in Firebase Firestore
   - Managed through `src/hooks/useStoreSettings.ts`
   - Applied globally via the `formatPrice` utility function

4. **Adding New Settings**:
   - Extend the `StoreSettings` interface in `src/lib/storeSettings.ts`
   - Add new fields to the Admin interface in `src/pages/Admin.tsx`
   - Implement the logic to use these settings in relevant components

## Theming and Styling

The project uses Tailwind CSS for styling:

- Utility classes for consistent styling
- Responsive design for all screen sizes
- Custom theme configuration in `tailwind.config.ts`
- Global styles in `src/index.css`

## Editing Guidelines

When editing the project with ChatGPT, follow these guidelines:

1. **Describe the component or page you want to modify**
   - Provide the file path if you know it
   - Describe the current functionality and what you want to change

2. **For UI changes**:
   - Describe the visual changes you want to make
   - Mention specific Tailwind classes if you have preferences
   - Reference existing components for consistency

3. **For functionality changes**:
   - Explain the current behavior
   - Describe the desired behavior
   - Mention any related components or contexts that might be affected

4. **For new features**:
   - Describe the feature in detail
   - Mention where it should appear in the application
   - Specify any data requirements or API interactions

## Common Tasks

### Adding a New Product

Products are managed through the Admin dashboard:

1. Navigate to the Admin page
2. Go to Products management
3. Create a new product with details, images, and variations

### Creating a Blog Post

Blog posts are managed in the Blog Admin:

1. Navigate to the Admin dashboard
2. Go to Blog management
3. Create a new post with title, content, and tags

### Changing the Theme

To modify the app's visual theme:

1. Edit `tailwind.config.ts` to update colors and typography
2. Modify global styles in `src/index.css`
3. Update component-specific styles in their respective files

### Adding a New Page

To add a new page to the application:

1. Create a new file in `src/pages/`
2. Add the route in `src/App.tsx`
3. Add navigation links as needed

## Troubleshooting

### Common Issues

1. **Build Errors**:
   - Check for TypeScript errors in the console
   - Verify that all imports point to existing files
   - Ensure all required dependencies are installed

2. **Firebase Connection Issues**:
   - Verify Firebase configuration in `src/lib/firebase.ts`
   - Check Firebase console for service availability
   - Ensure proper security rules are configured

3. **UI Inconsistencies**:
   - Check for proper Tailwind classes
   - Verify responsive design with different screen sizes
   - Ensure consistent use of theme colors and spacing

4. **Authentication Problems**:
   - Check Firebase Authentication settings
   - Verify protected routes are properly configured
   - Ensure AuthContext is providing correct state

## Color Palette

The application uses a consistent color palette:

- Primary: Tailwind's primary colors (configured in theme)
- Secondary: Lighter variations for backgrounds and accents
- Accent: Highlight colors for important elements
- Neutral: Grays for text and backgrounds

---

For more detailed information about specific parts of the application, refer to the comments in the code or ask ChatGPT for guidance on specific files and components.
