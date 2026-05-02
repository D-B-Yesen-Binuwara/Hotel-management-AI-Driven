# Hotel Management System - AI Driven

A modern hotel booking platform built with the MERN stack, featuring AI-powered search recommendations, secure payments, and role-based access control.

![MERN Stack](https://img.shields.io/badge/MERN-Stack-000000?style=flat&logo=mongodb&logoColor=white&logoColor=green)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF)
![OpenAI](https://img.shields.io/badge/OpenAI-AI-10A37F)

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS 4** for styling
- **Redux Toolkit** for state management
- **React Router 7** for navigation
- **Clerk** for authentication
- **Stripe** for payment processing

### Backend
- **Express 5** with TypeScript
- **MongoDB** with Mongoose ODM
- **Clerk** for auth middleware
- **Stripe** for payment processing
- **OpenAI** for AI features

---

## Features

### Core Functionality
- **Hotel Listings** - Browse and search hotels with filtering options
- **Hotel Details** - View comprehensive hotel information, images, and reviews
- **Room Booking** - Select dates and book rooms with real-time availability
- **Secure Payments** - Complete bookings via Stripe checkout
- **Booking History** - Track and manage your reservations
- **User Reviews** - Share experiences and rate hotels
- **Location Search** - Find hotels by destination

### User Roles
| Role | Permissions |
|------|-------------|
| **User** | Browse hotels, make bookings, leave reviews, view booking history |
| **Admin** | All user permissions + create/update/delete hotels, manage locations |

---

## AI Features

> A dedicated AI-powered search that understands natural language queries and provides personalized hotel recommendations.

The system uses **OpenAI's embedding technology** combined with **MongoDB vector search** to deliver intelligent hotel recommendations:

- **Semantic Search** - Describe your ideal stay in plain English (e.g., "cozy boutique hotel near the beach with good wifi")
- **Vector Embeddings** - Hotels are stored with AI-generated embeddings for similarity matching
- **Smart Recommendations** - GPT-4o-mini analyzes your preferences and suggests the best matches
- **Contextual Responses** - Get personalized explanations of why each hotel was recommended

The AI search goes beyond keyword matching to understand intent and preferences, making hotel discovery more intuitive and personalized.

---

## Authentication (Clerk Integration)

This project uses **Clerk** for secure and seamless authentication.

### Frontend Integration
- Sign-in/Sign-up pages with Clerk's pre-built components
- Protected routes using Clerk's `useUser` hook
- Session management with automatic token retrieval
- Public metadata for role-based access control

### Backend Integration
- JWT validation via `@clerk/express` middleware
- Secure API endpoints with authenticated requests
- Role verification through public metadata (`user.publicMetadata.role`)

### Role Management
- Users are assigned roles via Clerk's public metadata
- Admin role required for hotel management endpoints
- Route protection on both frontend and backend

---

## API Endpoints

### Hotels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hotels` | Get all hotels |
| GET | `/api/hotels/search` | Search hotels by query |
| GET | `/api/hotels/:id` | Get hotel by ID |
| POST | `/api/hotels` | Create new hotel (Admin) |
| POST | `/api/hotels/ai` | AI-powered hotel search |

### Locations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations` | Get all locations |
| POST | `/api/locations` | Add new location (Admin) |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Add review to hotel |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings/user` | Get user's bookings |
| POST | `/api/bookings` | Create new booking |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-checkout-session` | Create Stripe checkout session |
| GET | `/api/payments/session-status` | Get payment status |
| POST | `/api/stripe/webhook` | Handle Stripe webhooks |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Clerk account
- Stripe account
- OpenAI API key

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Backend (.env)**
```env
PORT=5080
MONGODB_URI=your_mongodb_uri
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
OPENAI_API_KEY=your_openai_api_key
```

**Frontend (.env)**
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Installation

```bash
# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### Running the Application

```bash
# Start backend (from Backend directory)
npm run dev

# Start frontend (from Frontend directory)
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5080`.

---

## Project Structure

```
├── Frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Route layouts
│   │   ├── lib/            # Utilities, API, store
│   │   └── styles/         # CSS files
│   └── package.json
│
├── Backend/
│   ├── src/
│   │   ├── api/           # Express routes
│   │   ├── application/   # Business logic
│   │   ├── domain/        # DTOs and types
│   │   ├── infrastructure/# Database entities
│   │   └── index.ts       # Server entry point
│   └── package.json
│
└── DOCS/                  # Project documentation
```

---

## License

ISC