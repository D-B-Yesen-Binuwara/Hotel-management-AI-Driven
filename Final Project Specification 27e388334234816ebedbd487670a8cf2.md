# Final Project Specification

This document outlines the complete requirements for the final hotel booking platform project. Students must complete all 5 tasks to demonstrate full-stack development skills with modern web technologies.

## Supporting Documents

[Booking Implementation and Stripe Integration](Booking%20Implementation%20and%20Stripe%20Integration%2027e38833423481d1a179ee1ffdafcbb4.md)

[Deploying a MERN stack app on Netlify and Render](Deploying%20a%20MERN%20stack%20app%20on%20Netlify%20and%20Render%2027e38833423481419549feac572a0b2f.md)

## Project Overview

Build a comprehensive hotel booking platform with payment processing, user account management, advanced filtering, AI search functionality, and a polished UI/UX. The platform should demonstrate proficiency in React, Node.js, MongoDB, Stripe payments, Clerk authentication, and modern design principles.

---

## Task 1: Core Booking & Payment System + Deployment

**Important**: Follow the comprehensive guides provided for this task:

- **Booking Implementation**: Refer to the codebase and booking + stripe document
- **Stripe Integration**: Refer to the codebase and the booking + stripe document
- **Deployment**: Follow your deployment guide for production setup
- **Reference Repositories**:
    - Backend: [https://github.com/ManupaDev/aidf-5-back-end](https://github.com/ManupaDev/aidf-5-back-end)
    - Frontend: [https://github.com/ManupaDev/aidf-5-front-end](https://github.com/ManupaDev/aidf-5-front-end)

### 1.1 Booking Feature Implementation

**Objective**: Implement a complete hotel booking system with user authentication

**Requirements**:

- ✅ **User Authentication**: Integrate Clerk for secure user login/signup
- ✅ **Hotel Selection**: Users can browse and select hotels
- ✅ **Date Selection**: Interactive date picker for check-in/check-out dates
- ✅ **Booking Creation**: Create booking records with PENDING status
- ✅ **Room Assignment**: Automatic unique room number generation
- ✅ **Validation**: Proper input validation and error handling

**Implementation**: Follow existing codebase patterns and the Stripe integration guide.

### 1.2 Stripe Payment Integration

**Objective**: Implement secure payment processing using Stripe

**Requirements**:

- ✅ **Product Catalog**: Stripe Products with default Prices for each hotel
- ✅ **Embedded Checkout**: Stripe Embedded Checkout integration
- ✅ **Payment Sessions**: Checkout Session creation with metadata linking
- ✅ **Webhook Handling**: Process payment confirmations asynchronously
- ✅ **Status Management**: Update booking status from PENDING to PAID
- ✅ **Error Handling**: Handle payment failures and edge cases

**Implementation**: Follow the detailed Stripe Integration documentation which includes: {Booking Implementation and Stripe Integration 27e38833423481d1a179ee1ffdafcbb4.mkd}

- Step-by-step Stripe dashboard configuration
- Code examples from the actual codebase
- Webhook setup and handling
- Environment variable configuration
- Security best practices

### 1.3 Deployment

**Objective**: Deploy both frontend and backend to production

**Requirements**:

- **Backend Deployment**: Deploy to cloud platform (Render, Railway, Heroku, etc.)
- **Frontend Deployment**: Deploy to Vercel, Netlify, or similar
- **Database**: MongoDB Atlas production cluster
- **Environment Variables**: Secure configuration management
- **HTTPS**: SSL certificates for secure communication
- **Webhook Configuration**: Production webhook endpoints
- **Testing**: Verify end-to-end functionality in production

**Implementation**: Follow your deployment guide for:

- Platform-specific deployment steps
- Environment variable configuration
- Database setup and connection
- Domain and SSL configuration
- Production testing procedures

**Deliverables**:

- Live backend URL
- Live frontend URL
- Functional payment flow in production
- Proper error handling and logging

---

## Task 2: My Account Page & Booking History

### 2.1 Account Dashboard

**Objective**: Create a comprehensive user account management page

**Requirements**:

- **User Profile**: Display user information from Clerk
- **Account Settings**: Basic profile management
- **Navigation**: Clear navigation between account sections
- **Responsive Design**: Mobile-friendly layout
- **Loading States**: Proper loading indicators

### 2.2 Booking History

**Objective**: Display user's booking history with detailed information

**Requirements**:

- **Chronological Order**: Bookings sorted by date (most recent first)
- **Booking Details**:
    - Hotel name, image, and location
    - Check-in and check-out dates
    - Room number
    - Payment status (PENDING/PAID)
    - Total amount paid
    - Booking date/time
- **Status Indicators**: Visual indicators for payment status
- **Empty State**: Meaningful message when no bookings exist
- **Filtering**: Filter by payment status or date range

### 2.3 Technical Implementation

**Backend Requirements**:

```jsx
// New API endpoints needed:
GET /api/bookings/user/:userId - Get user's bookings
// Enhanced booking response with hotel details populated

```

**Frontend Requirements**:

- New route: `/my-account`
- Components: AccountDashboard, BookingHistory, BookingCard
- State management: RTK Query for booking data
- UI: Cards, tables, or list view for bookings

**Database Considerations**:

- Efficient queries with proper indexing
- Population of hotel details in booking queries
- Pagination support for large datasets

---

## Task 3: UI/UX Customization & Brand Identity

### 3.1 Design System

**Objective**: Create a unique, cohesive design system that differentiates your project

**Requirements**:

- **Custom Color Palette**: Move beyond default Tailwind colors
- **Typography**: Custom font selections and hierarchy
- **Component Library**: Consistent button, card, and form styles
- **Spacing & Layout**: Consistent spacing and grid systems
- **Animation & Transitions**: Subtle animations for better UX

### 3.2 Visual Identity

**Objective**: Establish a strong brand presence

**Requirements**:

- **Logo Design**: Custom logo and branding elements
- **Imagery Strategy**: Consistent photo treatment and placeholders
- **Iconography**: Custom or consistent icon set
- **Layout Patterns**: Unique page layouts and component arrangements
- **Micro-interactions**: Hover effects, loading states, success animations

### 3.3 User Experience Improvements

**Objective**: Enhance usability and user satisfaction

**Requirements**:

- **Navigation**: Intuitive navigation structure
- **Accessibility**: WCAG compliance, keyboard navigation, screen reader support
- **Performance**: Optimized images, lazy loading, fast interactions
- **Mobile-First**: Excellent mobile experience
- **Feedback Systems**: Clear success/error messages, loading states

### 3.4 Inspiration Areas

Consider these elements to make your project unique:

- **Dark/Light Mode**: Theme switching capability
- **Glassmorphism/Neumorphism**: Modern design trends
- **Custom Illustrations**: Hand-drawn or custom graphics
- **Unique Layouts**: Masonry grids, asymmetrical designs
- **Advanced Animations**: Framer Motion, GSAP, or CSS animations
- **3D Elements**: Three.js for interactive elements

---

## Task 4: Hotel Listing Page with Advanced Filtering

### 4.1 Hotel Listing Page

**Objective**: Create a dedicated page to browse all available hotels

**Requirements**:

- **Grid/List View**: Toggle between card grid and detailed list view
- **Hotel Cards**:
    - High-quality images with image carousel
    - Hotel name, location, rating
    - Price per night
    - Key amenities
    - "View Details" and "Book Now" actions
- **Pagination**: Handle large hotel datasets efficiently
- **Loading States**: Skeleton screens during data fetching
- **Empty States**: Handle no results gracefully

### 4.2 Location Filtering

**Objective**: Allow users to filter hotels by location

**Requirements**:

- **Location Dropdown**: Searchable dropdown with all available locations
- **Multi-select**: Allow selection of multiple locations
- **Location Chips**: Show selected locations as removable chips
- **Clear Filters**: Easy way to reset location filters
- **URL State**: Preserve filters in URL for bookmarking/sharing

### 4.3 Price Sorting & Filtering

**Objective**: Enable price-based filtering and sorting

**Requirements**:

- **Price Range Slider**: Interactive slider for min/max price selection
- **Sort Options**:
    - Price: Low to High
    - Price: High to Low
    - Rating: High to Low
    - Alphabetical: A-Z
    - Featured/Recommended
- **Dynamic Updates**: Real-time filtering without page refresh
- **Price Display**: Clear price formatting with currency

### 4.4 Advanced Filtering (Bonus)

**Additional filtering options**:

- **Star Rating**: Filter by hotel star rating
- **Amenities**: Filter by specific amenities (WiFi, Pool, Gym, etc.)
- **Guest Rating**: Filter by user review scores
- **Availability**: Filter by check-in/check-out date availability

### 4.5 Technical Implementation

**Backend Requirements**:

```jsx
// Enhanced API endpoints:
GET /api/hotels?location=...&minPrice=...&maxPrice=...&sortBy=...&page=...
GET /api/locations - Get all unique locations for filter dropdown

```

**Frontend Requirements**:

- New route: `/hotels`
- Components: HotelGrid, HotelCard, FilterSidebar, SortDropdown
- State management: URL parameters, query state management
- Performance: Debounced search, optimistic updates

---

## Task 5: AI Search Clear & Reset Functionality

### 5.1 Current Search Issue

**Problem**: In the current system, when a user enters a search query and clicks "AI Search", the location filters and hotel list are replaced with search results. However, there's no way for users to clear the search and return to viewing all hotels.

**Current Flow**:

1. User sees location filters and full hotel list
2. User enters search query and clicks "AI Search"
3. UI shows only search results (filters disappear)
4. **Issue**: No way to clear search and return to original view

### 5.2 Required Solution

**Objective**: Implement clear search functionality to improve user experience

**Requirements**:

- **Clear Search Button**: Add a prominent "Clear Search" or "Show All Hotels" button
- **Search State Management**: Properly manage search state in the application
- **UI Restoration**: When cleared, restore the original location filters and full hotel list
- **Visual Feedback**: Clear indication of current search state (searching vs. showing all)
- **Multiple Clear Options**:
    - Clear button in search results area
    - Option to clear by clicking "Show All Hotels" in navigation
    - Keyboard shortcut (Escape key) to clear search

### 5.3 Technical Implementation

**Frontend Requirements**:

- **State Management**: Track whether user is in "search mode" or "browse mode"
- **Conditional Rendering**: Show appropriate UI based on current state
- **Search Reset**: Clear search query and restore original hotel list
- **Filter Restoration**: Re-enable location filters when search is cleared

**Backend Considerations**:

- **API Endpoints**: Ensure `/api/hotels` endpoint works for both search and browse modes
- **Data Consistency**: Maintain consistent data structure between search and browse views

### 5.4 Implementation Details

**Components to Modify/Create**:

- **SearchBar Component**: Add clear functionality
- **HotelList Component**: Handle search vs. browse state
- **FilterSidebar Component**: Show/hide based on current mode
- **SearchResults Component**: Display search results with clear option

**State Management**:

```jsx
// Example state structure
const [searchMode, setSearchMode] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);

// Clear search function
const clearSearch = () => {
  setSearchMode(false);
  setSearchQuery('');
  setSearchResults([]);
  // Restore original hotel list and filters
};

```

**API Integration**:

- Maintain existing search endpoint functionality
- Ensure browse endpoint returns full hotel list with filters
- Handle state transitions smoothly

---