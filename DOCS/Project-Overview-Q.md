# AI Feature Implementation in Hotel Management System

## Overview

The AI feature in this hotel management system provides intelligent hotel search and recommendation capabilities using OpenAI's GPT-4 and text embeddings. The system combines vector search with natural language processing to deliver personalized hotel recommendations based on user queries.

## Architecture Flow

### 1. Data Preparation & Embeddings Generation

**Files Involved:**
- `Backend/src/application/utils/embeddings.ts`
- `Backend/src/seed.ts`
- `Backend/src/infrastructure/entities/Hotel.ts`

**Process:**
1. **Hotel Data Structure**: Each hotel contains an `embedding` field (array of numbers) in the MongoDB schema
2. **Embedding Generation**: During hotel creation or seeding, text embeddings are generated using OpenAI's `text-embedding-3-small` model
3. **Text Composition**: Hotel embeddings are created from concatenated text: `name + description + location + price`

**Code Snippet - Embedding Generation:**
```typescript
// embeddings.ts
export const generateEmbedding = async (text: string) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    dimensions: 1536,
    input: text,
  });
  return response.data[0].embedding;
};
```

**Code Snippet - Hotel Schema:**
```typescript
// Hotel.ts
const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  embedding: { type: [Number], default: [] }, // Vector embeddings
  // ... other fields
});
```

### 2. Frontend AI Search Interface

**Files Involved:**
- `Frontend/src/components/AISearch.jsx`
- `Frontend/src/lib/features/searchSlice.js`
- `Frontend/src/lib/api.js`

**Process:**
1. **User Input**: User enters natural language query in the AI search component
2. **State Management**: Redux manages search state with `isAiSearch` flag
3. **API Call**: RTK Query mutation sends query to backend AI endpoint

**Code Snippet - AI Search Component:**
```jsx
// AISearch.jsx
const handleSearch = async () => {
  try {
    const result = await aiSearch(value.trim()).unwrap();
    dispatch(setAiSearch({
      query: value.trim(),
      response: result.response,
      hotels: result.hotels
    }));
  } catch (error) {
    toast.error("AI search failed. Please try again.");
  }
};
```

**Code Snippet - API Configuration:**
```javascript
// api.js
aiSearch: build.mutation({
  query: (query) => ({
    url: "hotels/ai",
    method: "POST",
    body: { query },
  }),
}),
```

### 3. Backend AI Processing

**Files Involved:**
- `Backend/src/application/ai.ts`
- `Backend/src/api/hotel.ts`

**Process:**
1. **Query Reception**: Backend receives user query via POST `/api/hotels/ai`
2. **Vector Search**: Query is converted to embedding and used for MongoDB vector search
3. **AI Response Generation**: GPT-4 generates personalized recommendations
4. **Response Formatting**: Returns both AI response text and matching hotels

**Code Snippet - AI Query Handler:**
```typescript
// ai.ts
export const respondToAIQuery = async (req: Request, res: Response, next: NextFunction) => {
  const { query } = req.body;
  
  // Generate embedding for user query
  const queryEmbedding = await generateEmbedding(query);
  
  // Vector search in MongoDB
  const relevantHotels = await Hotel.aggregate([
    {
      $vectorSearch: {
        index: "hotel_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 25,
        limit: 8,
      },
    },
    {
      $project: {
        _id: 1, name: 1, location: 1, price: 1,
        image: 1, rating: 1, description: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  // Create context for AI
  const hotelContext = relevantHotels.map(hotel => 
    `${hotel.name} in ${hotel.location} - $${hotel.price}/night, Rating: ${hotel.rating || 'N/A'}, Description: ${hotel.description}`
  ).join('\n');

  // Generate AI response
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a helpful hotel recommendation assistant. Based on the user's query, recommend the most suitable hotels from the available options. Provide a brief, friendly response with specific hotel recommendations and why they match the user's needs. Keep it concise and helpful.\n\nAvailable hotels:\n${hotelContext}`
      },
      { role: "user", content: query }
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  res.status(200).json({
    response: aiResponse,
    hotels: relevantHotels
  });
};
```

### 4. Results Display

**Files Involved:**
- `Frontend/src/components/AISearchResults.jsx`
- `Frontend/src/components/HotelsView.jsx`

**Process:**
1. **Conditional Rendering**: `HotelsView` component checks `isAiSearch` flag
2. **AI Response Display**: Shows GPT-4 generated recommendation text
3. **Hotel Cards**: Displays matching hotels with similarity scores
4. **Interactive Features**: Clear search, view all hotels options

**Code Snippet - Results Display Logic:**
```jsx
// HotelsView.jsx
export default function HotelsView() {
  const { query, isAiSearch } = useSelector((state) => state.search);

  if (query !== "") {
    if (isAiSearch) {
      return <AISearchResults />;
    } else {
      return <HotelSearchResults />;
    }
  } else {
    return <HotelListings />;
  }
}
```

## Technical Implementation Details

### Vector Search Configuration
- **Database**: MongoDB with vector search index `hotel_vector_index`
- **Embedding Model**: OpenAI `text-embedding-3-small` (1536 dimensions)
- **Search Parameters**: 25 candidates, 8 results limit
- **Similarity Scoring**: Cosine similarity with metadata scores

### AI Model Configuration
- **Model**: GPT-4o-mini for cost efficiency
- **Max Tokens**: 300 for concise responses
- **Temperature**: 0.7 for balanced creativity/consistency
- **System Prompt**: Structured to provide helpful hotel recommendations

### State Management Flow
1. User input → `AISearch` component
2. API call → `useAiSearchMutation` hook
3. Success → `setAiSearch` action updates Redux store
4. Render → `AISearchResults` component displays results

### Error Handling
- Frontend: Toast notifications for user feedback
- Backend: Global error middleware catches and formats errors
- API: Graceful fallbacks for missing data

## Key Features

1. **Natural Language Processing**: Users can describe their ideal hotel experience in plain English
2. **Semantic Search**: Vector embeddings enable understanding of context and intent
3. **Personalized Recommendations**: AI generates tailored suggestions based on user preferences
4. **Similarity Scoring**: Hotels are ranked by relevance with percentage match scores
5. **Responsive UI**: Clean, intuitive interface with loading states and error handling

## Dependencies

### Backend
- `openai`: OpenAI API client
- `mongoose`: MongoDB ODM with vector search support

### Frontend
- `@reduxjs/toolkit`: State management
- `react-redux`: React-Redux bindings
- `sonner`: Toast notifications

## Environment Variables Required

```env
# Backend
OPENAI_API_KEY=your_openai_api_key

# Frontend
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

This AI implementation creates a sophisticated hotel recommendation system that understands user intent and provides intelligent, contextual suggestions through the combination of vector search and large language models.

------------------------------------------------------------------------------

## Stripe Integration

The Stripe integration provides secure payment processing for hotel bookings using Stripe's embedded checkout and webhook system for real-time payment status updates.

### Architecture Flow

**Files Involved:**
- `Backend/src/application/payment.ts`
- `Backend/src/api/payment.ts`
- `Frontend/src/components/CheckoutForm.jsx`
- `Frontend/src/pages/payment.page.jsx`
- `Frontend/src/pages/complete.page.jsx`

### 1. Payment Session Creation

**Process:**
1. User initiates booking and gets redirected to payment page
2. Frontend requests checkout session from backend
3. Backend creates Stripe checkout session with booking details
4. Frontend renders embedded Stripe checkout form

**Code Snippet - Backend Session Creation:**
```typescript
// payment.ts
export const createCheckoutSession = async (req: Request, res: Response) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId).populate("hotelId");
  
  const numberOfNights = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) 
    / (1000 * 60 * 60 * 24)
  );

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: [{
      price: hotel.stripePriceId,
      quantity: numberOfNights,
    }],
    mode: "payment",
    return_url: `${FRONTEND_URL}/booking/complete?session_id={CHECKOUT_SESSION_ID}`,
    metadata: { bookingId: booking._id.toString() },
  });

  res.json({ clientSecret: session.client_secret });
};
```

**Code Snippet - Frontend Checkout Form:**
```jsx
// CheckoutForm.jsx
const fetchClientSecret = useCallback(async () => {
  const token = await getToken();
  const response = await fetch("/api/payments/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookingId }),
  });
  
  const data = await response.json();
  return data.clientSecret;
}, [bookingId, getToken]);

return (
  <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
    <EmbeddedCheckout />
  </EmbeddedCheckoutProvider>
);
```

### 2. Payment Processing & Webhooks

**Process:**
1. User completes payment in Stripe checkout
2. Stripe sends webhook to backend for payment confirmation
3. Backend updates booking status to "PAID"
4. User redirected to completion page

**Code Snippet - Webhook Handler:**
```typescript
// payment.ts
export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  const event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);

  if (event.type === "checkout.session.completed") {
    await fulfillCheckout((event.data.object as any).id);
  }
};

async function fulfillCheckout(sessionId: string) {
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
  const booking = await Booking.findById(checkoutSession.metadata?.bookingId);
  
  if (checkoutSession.payment_status !== "unpaid") {
    await Booking.findByIdAndUpdate(booking._id, { paymentStatus: "PAID" });
  }
}
```

### 3. Payment Status Verification

**Process:**
1. User lands on completion page with session ID
2. Frontend queries backend for payment status
3. Backend retrieves Stripe session and updates booking if needed
4. Frontend displays success/failure message with booking details

**Code Snippet - Status Retrieval:**
```typescript
// payment.ts
export const retrieveSessionStatus = async (req: Request, res: Response) => {
  const { session_id } = req.query;
  const session = await stripe.checkout.sessions.retrieve(session_id as string);
  const booking = await Booking.findById(session.metadata?.bookingId).populate("hotelId");
  
  if (session.payment_status !== "unpaid" && booking.paymentStatus === "PENDING") {
    await Booking.findByIdAndUpdate(booking._id, { paymentStatus: "PAID" });
    booking.paymentStatus = "PAID";
  }

  res.json({
    status: session.status,
    paymentStatus: booking.paymentStatus,
    booking,
    hotel: booking.hotelId,
  });
};
```

### 4. Hotel Price Integration

**Process:**
1. During hotel creation, Stripe product and price are created
2. `stripePriceId` is stored in hotel document
3. Checkout sessions use this price ID for consistent pricing

**Code Snippet - Hotel Creation with Stripe:**
```typescript
// hotel.ts
export const createHotel = async (req: Request, res: Response) => {
  const result = CreateHotelDTO.safeParse(req.body);
  
  let stripePriceId = null;
  if (stripe) {
    const product = await stripe.products.create({
      name: result.data.name,
      description: result.data.description,
      default_price_data: {
        unit_amount: Math.round(result.data.price * 100), // Convert to cents
        currency: "usd",
      },
    });
    stripePriceId = product.default_price as string;
  }

  await Hotel.create({ ...result.data, embedding, stripePriceId });
};
```

### Technical Implementation Details

**Security Features:**
- Webhook signature verification using Stripe secret
- User authentication required for all payment operations
- Booking ownership validation before payment processing
- Secure client secret generation for frontend checkout

**Error Handling:**
- Graceful fallbacks when Stripe is not configured
- Comprehensive validation for booking dates and amounts
- Retry mechanisms for failed payment attempts
- User-friendly error messages for different failure scenarios

**Payment Flow States:**
1. **PENDING**: Initial booking state, payment not completed
2. **PAID**: Payment successfully processed and confirmed
3. Webhook ensures eventual consistency between Stripe and database

**Environment Variables Required:**
```env
# Backend
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:5173

# Frontend  
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### API Endpoints

- `POST /api/payments/create-checkout-session` - Creates Stripe checkout session
- `GET /api/payments/session-status` - Retrieves payment status
- `POST /api/stripe/webhook` - Handles Stripe webhook events

The Stripe integration ensures secure, reliable payment processing with real-time status updates and comprehensive error handling for a smooth user experience.

## Authentication

The authentication system uses Clerk as the identity provider, implementing JWT-based authentication with role-based authorization. This creates a secure, scalable authentication flow that protects both frontend routes and backend API endpoints.

### Architecture Flow

**Files Involved:**
- `Backend/src/api/middleware/authentication-middleware.ts` - JWT validation middleware
- `Backend/src/api/middleware/authorization-middleware.ts` - Role-based access control
- `Frontend/src/layouts/protect.layout.jsx` - User route protection
- `Frontend/src/layouts/admin-protect.layout.jsx` - Admin route protection
- `Frontend/src/lib/api.js` - Automatic token injection
- `Backend/src/index.ts` - Clerk middleware setup

### 1. User Authentication Flow

**Detailed Process:**
1. **User Login**: User authenticates through Clerk's hosted UI or embedded components
2. **Token Generation**: Clerk generates JWT with user claims and metadata
3. **Frontend State**: Clerk React hooks manage authentication state automatically
4. **API Requests**: RTK Query automatically injects JWT tokens in request headers
5. **Backend Validation**: Express middleware validates JWT on each protected endpoint
6. **Route Protection**: Frontend layouts redirect unauthenticated users to sign-in

**Code Snippet - Backend Clerk Setup:**
```typescript
// index.ts
import { clerkMiddleware } from "@clerk/express";

app.use(clerkMiddleware()); // Reads JWT and sets auth object on request
```

**Code Snippet - Authentication Middleware:**
```typescript
// authentication-middleware.ts
import { getAuth } from "@clerk/express";
import UnauthorizedError from "../../domain/errors/unauthorized-error";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req); // Extract auth from Clerk middleware
  if (!auth?.isAuthenticated) {
    throw new UnauthorizedError("Unauthorized");
  }
  // Auth object contains: userId, sessionId, sessionClaims
  next();
};
```

**Code Snippet - Frontend Route Protection:**
```jsx
// protect.layout.jsx
import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router";

const ProtectLayout = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  // Wait for Clerk to load authentication state
  if (!isLoaded) return null;
  
  // Redirect to sign-in if not authenticated
  if (isLoaded && !isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  // Render protected routes
  return <Outlet />;
};
```

### 2. Role-Based Authorization

**Detailed Process:**
1. **Role Assignment**: Admin roles stored in Clerk user `publicMetadata.role`
2. **Session Claims**: Role information included in JWT session claims
3. **Backend Validation**: Middleware checks `sessionClaims.metadata.role`
4. **Frontend Protection**: Admin layout checks user metadata before rendering
5. **Access Control**: Different permission levels for regular users vs admins

**Code Snippet - Admin Authorization Middleware:**
```typescript
// authorization-middleware.ts
import { getAuth } from "@clerk/express";
import ForbiddenError from "../../domain/errors/forbidden-error";

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  
  // Check if user has admin role in session claims
  if (auth?.sessionClaims?.metadata?.role !== "admin") {
    throw new ForbiddenError("Forbidden");
  }
  next();
};
```

**Code Snippet - Frontend Admin Protection:**
```jsx
// admin-protect.layout.jsx
import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router";

export default function AdminProtectLayout() {
  const { user } = useUser();

  // Check user metadata for admin role
  if (user?.publicMetadata?.role !== "admin") {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}
```

### 3. API Request Authentication

**Detailed Process:**
1. **Token Retrieval**: Frontend gets fresh JWT from Clerk session
2. **Header Injection**: RTK Query automatically adds Authorization header
3. **Request Validation**: Backend middleware validates token signature
4. **User Context**: Authenticated user ID available in request handlers
5. **Error Handling**: Invalid tokens return 401 Unauthorized

**Code Snippet - Automatic Token Injection:**
```javascript
// api.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5080/api/",
    prepareHeaders: async (headers) => {
      return new Promise((resolve) => {
        async function checkToken() {
          const clerk = window.Clerk;
          if (clerk) {
            // Get fresh JWT token from Clerk
            const token = await clerk.session?.getToken();
            headers.set("Authorization", `Bearer ${token}`);
            resolve(headers);
          } else {
            // Retry if Clerk not loaded yet
            setTimeout(checkToken, 500);
          }
        }
        checkToken();
      });
    },
  }),
});
```

**Code Snippet - Using Auth in Handlers:**
```typescript
// booking.ts
import { getAuth } from "@clerk/express";

export const createBooking = async (req: Request, res: Response) => {
  const auth = getAuth(req);
  
  // Access authenticated user ID
  if (!auth?.userId) {
    throw new ValidationError("User authentication required");
  }

  // Use userId to associate booking with user
  const booking = await Booking.create({
    userId: auth.userId, // From JWT claims
    hotelId,
    // ... other fields
  });
};
```

## Hotel Booking Feature

The booking system orchestrates a complex multi-service workflow that manages the complete reservation lifecycle from initial creation through payment completion. It ensures data consistency across multiple entities while maintaining a smooth user experience.

### Architecture Flow

**Files Involved:**
- `Backend/src/application/booking.ts` - Core booking business logic
- `Backend/src/api/booking.ts` - Booking API routes and middleware
- `Frontend/src/components/BookingDialog.jsx` - User booking interface
- `Backend/src/infrastructure/entities/Booking.ts` - Booking data model
- `Backend/src/application/hotel.ts` - Hotel validation and pricing
- `Backend/src/application/payment.ts` - Payment processing integration
- `Frontend/src/pages/payment.page.jsx` - Payment flow UI

### 1. Booking Creation Process

**Detailed Service Interactions:**

**Step 1: Frontend Booking Initiation**
```jsx
// BookingDialog.jsx
const handleSubmit = async (data) => {
  try {
    // Validate dates on frontend
    const result = await onSubmit({
      hotelId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
    });
    
    // Navigate to payment on success
    navigate(`/booking/payment?bookingId=${result.booking._id}`);
  } catch (error) {
    toast.error(error.message || "Failed to create booking");
  }
};
```

**Step 2: Backend Booking Processing**
```typescript
// booking.ts - Complete booking creation flow
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Authentication validation
    const auth = getAuth(req);
    if (!auth?.userId) {
      throw new ValidationError("User authentication required");
    }

    // 2. Input validation using Zod schema
    const result = CreateBookingDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(`${result.error.message}`);
    }

    const { hotelId, checkIn, checkOut } = result.data;

    // 3. Hotel existence and availability validation
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }

    // 4. Room number generation (sequential)
    const roomNumber = await generateRoomNumber();

    // 5. Business logic calculations
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const numberOfNights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalAmount = numberOfNights * hotel.price;

    // 6. Booking record creation
    const booking = await Booking.create({
      userId: auth.userId,
      hotelId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      roomNumber,
      paymentStatus: "PENDING",
      totalAmount,
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking: {
        _id: booking._id,
        roomNumber: booking.roomNumber,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};
```

**Step 3: Room Number Generation Logic**
```typescript
// booking.ts - Ensures unique room assignments
const generateRoomNumber = async (): Promise<number> => {
  const lastBooking = await Booking.findOne().sort({ roomNumber: -1 });
  return lastBooking ? lastBooking.roomNumber + 1 : 101;
};
```

### 2. Booking State Management & Lifecycle

**State Definitions:**
- **PENDING**: Initial state after booking creation, awaiting payment
- **PAID**: Payment successfully processed and confirmed

**Detailed State Transitions:**
1. **Creation**: User submits booking form → Backend creates booking with PENDING status
2. **Payment Initiation**: User redirected to payment page with booking ID
3. **Payment Processing**: Stripe processes payment, sends webhook
4. **Completion**: Webhook handler updates booking to PAID status
5. **Confirmation**: User sees success page with booking details

**Code Snippet - Booking Schema:**
```typescript
// Booking.ts - Data model with state management
const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  roomNumber: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID"], // Only two states
    default: "PENDING",
  },
  totalAmount: { type: Number, required: true },
}, {
  timestamps: true, // Automatic createdAt/updatedAt
});
```

### 3. Related Services Integration

**Hotel Service Integration:**
```typescript
// hotel.ts - Hotel validation in booking process
export const getHotelById = async (req: Request, res: Response) => {
  const hotel = await Hotel.findById(req.params._id);
  if (!hotel) {
    throw new NotFoundError("Hotel not found");
  }
  // Hotel data used for booking validation and pricing
  res.status(200).json(hotel);
};
```

**Payment Service Integration:**
```typescript
// payment.ts - Booking-Payment relationship
export const createCheckoutSession = async (req: Request, res: Response) => {
  const { bookingId } = req.body;
  
  // Retrieve booking for payment processing
  const booking = await Booking.findById(bookingId).populate("hotelId");
  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  // Validate booking ownership
  if (booking.userId !== auth.userId) {
    throw new ValidationError("Unauthorized access to booking");
  }

  // Create Stripe session with booking metadata
  const session = await stripe.checkout.sessions.create({
    metadata: {
      bookingId: booking._id.toString(),
      userId: auth.userId,
    },
    // ... other Stripe configuration
  });
};
```

**User Service Integration:**
```typescript
// booking.ts - User-specific booking retrieval
export const getUserBookings = async (req: Request, res: Response) => {
  const auth = getAuth(req);
  
  // Get all bookings for authenticated user
  const bookings = await Booking.find({ userId: auth.userId })
    .populate("hotelId") // Include hotel details
    .sort({ createdAt: -1 }); // Most recent first

  res.status(200).json(bookings);
};
```

### 4. Frontend Booking Flow

**Code Snippet - Complete Booking Dialog:**
```jsx
// BookingDialog.jsx - User interface for booking creation
const BookingDialog = ({ hotelName, hotelId, onSubmit, isLoading }) => {
  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: { checkIn: "", checkOut: "" },
  });

  const handleSubmit = async (data) => {
    try {
      const result = await onSubmit({
        hotelId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
      });
      
      toast.success("Booking created successfully!");
      navigate(`/booking/payment?bookingId=${result.booking._id}`);
    } catch (error) {
      toast.error(error.message || "Failed to create booking");
    }
  };

  // Form validation schema
  const bookingSchema = z.object({
    checkIn: z.string().min(1, "Check-in date is required"),
    checkOut: z.string().min(1, "Check-out date is required"),
  }).refine((data) => {
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return checkIn >= today && checkOut > checkIn;
  }, {
    message: "Check-out must be after check-in and check-in must be today or later",
    path: ["checkOut"],
  });
};
``` history
- Enforces booking ownership validation

### Transaction Handling & Data Consistency

**No Database Transactions Used:**
After thorough code analysis, the system does **not implement database transactions or handle transaction deadlocks**. Here's why:

**Atomic Operations Strategy:**
- **Single Document Operations**: All database operations are atomic at the document level
- **Booking Creation**: Single `Booking.create()` call - atomic by MongoDB design
- **Payment Updates**: Single `Booking.findByIdAndUpdate()` call - atomic operation
- **Hotel Creation**: Single `Hotel.create()` call with embedding generation

**Code Evidence - No Transactions:**
```typescript
// booking.ts - No transaction wrapper
export const createBooking = async (req: Request, res: Response) => {
  // No session.startTransaction() or similar
  const booking = await Booking.create({ /* data */ }); // Single atomic operation
  res.status(201).json({ booking });
};

// payment.ts - No transaction for status update
async function fulfillCheckout(sessionId: string) {
  // No multi-document transaction
  await Booking.findByIdAndUpdate(booking._id, { paymentStatus: "PAID" }); // Single atomic update
}
```

**Consistency Strategy Without Transactions:**
1. **Eventual Consistency**: Stripe webhooks ensure payment status synchronization
2. **Idempotent Operations**: Webhook handlers check existing state before updates
3. **Single Source of Truth**: Booking status managed in one document
4. **Error Boundaries**: Global error handling prevents partial state corruption

**Why No Transactions Needed:**
- **Simple Data Model**: Each booking is independent
- **No Complex Relationships**: No cascading updates required
- **External Payment System**: Stripe handles payment consistency
- **Stateless Operations**: Each API call is independent

**Code Snippet - Idempotent Webhook Handling:**
```typescript
// payment.ts - Prevents duplicate updates without transactions
async function fulfillCheckout(sessionId: string) {
  const booking = await Booking.findById(checkoutSession.metadata?.bookingId);
  
  // Check current state to prevent duplicate processing
  if (booking.paymentStatus !== "PENDING") {
    console.log("Booking already processed:", booking._id);
    return; // Idempotent - safe to call multiple times
  }

  // Only update if payment successful and booking still pending
  if (checkoutSession.payment_status !== "unpaid") {
    await Booking.findByIdAndUpdate(booking._id, { paymentStatus: "PAID" });
  }
}
```

## State Management

The frontend implements a comprehensive state management architecture using Redux Toolkit with RTK Query, providing centralized state management, automatic API synchronization, and optimistic UI updates across the entire application.

### Architecture Overview

**Files Involved:**
- `Frontend/src/lib/store.js` - Redux store configuration
- `Frontend/src/lib/features/searchSlice.js` - Search state management
- `Frontend/src/lib/features/counterSlice.js` - Example counter state
- `Frontend/src/lib/api.js` - RTK Query API definitions
- `Frontend/src/main.jsx` - Provider setup

### 1. Redux Store Configuration

**Detailed Store Setup:**
```javascript
// store.js - Complete store configuration
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./features/counterSlice";
import searchReducer from "./features/searchSlice";
import { api } from "./api";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    counter: counterReducer,     // Example feature state
    search: searchReducer,       // Search functionality state
    [api.reducerPath]: api.reducer, // RTK Query API state
  },
  // RTK Query middleware for caching, invalidation, polling
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// Enable automatic refetching on focus/reconnect
setupListeners(store.dispatch);
```

**Code Snippet - Provider Setup:**
```jsx
// main.jsx - Redux Provider integration
import { Provider } from "react-redux";
import { store } from "./lib/store.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

### 2. Search State Management

**Detailed State Structure & Logic:**
```javascript
// searchSlice.js - Complete search state management
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  query: "",           // Current search query
  isAiSearch: false,   // Flag to differentiate AI vs regular search
  aiResponse: "",      // GPT-4 generated response text
  aiHotels: [],        // Hotels returned from AI search
};

export const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    // Regular search query update
    setQuery: (state, action) => {
      state.query = action.payload;
      state.isAiSearch = false; // Reset AI search flag
      state.aiResponse = "";
      state.aiHotels = [];
    },
    
    // AI search results update
    setAiSearch: (state, action) => {
      state.query = action.payload.query;
      state.isAiSearch = true;
      state.aiResponse = action.payload.response;
      state.aiHotels = action.payload.hotels;
    },
    
    // Clear all search state
    resetQuery: (state) => {
      state.query = "";
      state.isAiSearch = false;
      state.aiResponse = "";
      state.aiHotels = [];
    },
  },
});

export const { setQuery, setAiSearch, resetQuery } = searchSlice.actions;
export default searchSlice.reducer;
```

**Code Snippet - State Usage in Components:**
```jsx
// HotelsView.jsx - Conditional rendering based on search state
import { useSelector } from "react-redux";

export default function HotelsView() {
  const { query, isAiSearch } = useSelector((state) => state.search);

  // Conditional rendering based on search state
  if (query !== "") {
    if (isAiSearch) {
      return <AISearchResults />; // Show AI-powered results
    } else {
      return <HotelSearchResults />; // Show regular search results
    }
  } else {
    return <HotelListings />; // Show all hotels
  }
}
```

### 3. RTK Query API State Management

**Comprehensive API Configuration:**
```javascript
// api.js - Complete RTK Query setup
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5080/api/",
    prepareHeaders: async (headers) => {
      // Automatic authentication token injection
      return new Promise((resolve) => {
        async function checkToken() {
          const clerk = window.Clerk;
          if (clerk) {
            const token = await clerk.session?.getToken();
            headers.set("Authorization", `Bearer ${token}`);
            resolve(headers);
          } else {
            setTimeout(checkToken, 500);
          }
        }
        checkToken();
      });
    },
  }),
  
  // Cache invalidation tags
  tagTypes: ['Hotels', 'Locations', 'Bookings'],
  
  endpoints: (build) => ({
    // Query endpoints (GET requests)
    getAllHotels: build.query({
      query: () => "hotels",
      providesTags: [{ type: "Hotels", id: "LIST" }],
      transformErrorResponse: (response) => {
        if (response.status === 'FETCH_ERROR') {
          return { message: 'Backend server is not running.' };
        }
        return response;
      },
    }),
    
    // Mutation endpoints (POST/PUT/DELETE requests)
    createBooking: build.mutation({
      query: (booking) => ({
        url: "bookings",
        method: "POST",
        body: booking,
      }),
      invalidatesTags: ["Bookings"], // Refresh bookings list after creation
    }),
    
    // AI search mutation
    aiSearch: build.mutation({
      query: (query) => ({
        url: "hotels/ai",
        method: "POST",
        body: { query },
      }),
    }),
  }),
});

// Auto-generated hooks for components
export const {
  useGetAllHotelsQuery,
  useCreateBookingMutation,
  useAiSearchMutation,
} = api;
```

### 4. Component State Integration

**Detailed State Flow Examples:**

**AI Search Integration:**
```jsx
// AISearch.jsx - Complete state integration
import { useDispatch } from "react-redux";
import { setAiSearch } from "@/lib/features/searchSlice";
import { useAiSearchMutation } from "@/lib/api";

export default function AISearch() {
  const dispatch = useDispatch();
  const [value, setValue] = useState("");
  const [aiSearch, { isLoading }] = useAiSearchMutation();

  const handleSearch = async () => {
    try {
      // 1. Call API via RTK Query
      const result = await aiSearch(value.trim()).unwrap();
      
      // 2. Update Redux state with results
      dispatch(setAiSearch({
        query: value.trim(),
        response: result.response,
        hotels: result.hotels
      }));
      
      // 3. Show success feedback
      toast.success("AI search completed!");
    } catch (error) {
      // 4. Handle errors gracefully
      toast.error("AI search failed. Please try again.");
    }
  };
}
```

**Booking State Integration:**
```jsx
// BookingDialog.jsx - Mutation with optimistic updates
import { useCreateBookingMutation } from "@/lib/api";

const BookingDialog = ({ hotelId }) => {
  const [createBooking, { isLoading }] = useCreateBookingMutation();

  const handleSubmit = async (data) => {
    try {
      // RTK Query automatically handles loading states
      const result = await createBooking({
        hotelId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
      }).unwrap();
      
      // Navigate on success
      navigate(`/booking/payment?bookingId=${result.booking._id}`);
    } catch (error) {
      // Error handling with user feedback
      toast.error(error.message || "Failed to create booking");
    }
  };
};
```

### 5. Authentication State Integration

**Clerk Integration (No Redux Needed):**
```jsx
// Authentication state managed by Clerk hooks
import { useUser, useAuth } from "@clerk/clerk-react";

const MyComponent = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  // Clerk manages authentication state automatically
  // No need for Redux authentication state
  if (!isLoaded) return <Loading />;
  if (!isSignedIn) return <SignIn />;
  
  return <AuthenticatedContent user={user} />;
};
```

### 6. State Management Benefits

**Automatic Features:**
- **Caching**: RTK Query automatically caches API responses
- **Background Refetching**: Stale data refreshed automatically
- **Optimistic Updates**: UI updates immediately, rolls back on error
- **Loading States**: Automatic loading/error state management
- **Deduplication**: Identical requests are deduplicated
- **Invalidation**: Smart cache invalidation on mutations

**Developer Experience:**
- **DevTools Integration**: Redux DevTools for debugging
- **Type Safety**: Full TypeScript support
- **Hot Reloading**: State preserved during development
- **Time Travel Debugging**: Action replay and state inspection

--------------------------------------

## Filter and Sort Feature

The filter and sort system provides comprehensive hotel filtering capabilities with real-time updates, client-side processing, and an intuitive user interface. The system combines multiple filter types with sorting options and pagination for optimal user experience.

### Architecture Overview

**Files Involved:**
- `Frontend/src/pages/hotels-listing.page.jsx` - Main listing page with filter logic
- `Frontend/src/components/FilterSidebar.jsx` - Filter UI components
- `Frontend/src/components/HotelListings.jsx` - Basic hotel display (no filters)
- `Frontend/src/lib/api.js` - Data fetching for hotels and locations

### 1. Filter System Implementation

**Filter Types Available:**
1. **Location Filter** - Multi-select checkbox with search
2. **Price Range Filter** - Dual slider with manual input
3. **Star Rating Filter** - Radio button selection
4. **Search Filter** - Text-based hotel name search
5. **Sort Options** - Multiple sorting criteria

### 2. Client-Side Filtering Logic

**Detailed Filter Processing:**
```javascript
// hotels-listing.page.jsx - Complete filtering pipeline
const HotelsListingPage = () => {
  // Filter state management
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [starRating, setStarRating] = useState(null);
  
  // Get all hotels from API
  const { data: hotels } = useGetAllHotelsQuery();
  const { data: locations } = useGetAllLocationsQuery();
  
  // Apply filters in sequence
  let filteredHotels = hotels;
  
  // 1. Location Filter - Multi-select with partial matching
  if (selectedLocations.length > 0) {
    const selectedLocationNames = locations?.filter(loc => 
      selectedLocations.includes(loc._id)
    ).map(loc => loc.name) || [];
    
    filteredHotels = filteredHotels?.filter(hotel => 
      selectedLocationNames.some(locName => 
        hotel.location.toLowerCase().includes(locName.toLowerCase())
      )
    );
  }
  
  // 2. Search Filter - Hotel name matching
  if (searchQuery.trim()) {
    filteredHotels = filteredHotels?.filter(hotel => 
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // 3. Price Range Filter - Inclusive range
  filteredHotels = filteredHotels?.filter(hotel => 
    hotel.price >= priceRange[0] && hotel.price <= priceRange[1]
  );
  
  // 4. Star Rating Filter - Minimum rating
  if (starRating !== null) {
    filteredHotels = filteredHotels?.filter(hotel => 
      (hotel.rating || 0) >= starRating
    );
  }
};
```

### 3. Sorting Implementation

**Multi-Criteria Sorting Logic:**
```javascript
// hotels-listing.page.jsx - Comprehensive sorting system
if (filteredHotels) {
  filteredHotels = [...filteredHotels].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name); // Alphabetical A-Z
      case "name-desc":
        return b.name.localeCompare(a.name); // Alphabetical Z-A
      case "price-asc":
        return a.price - b.price; // Price low to high
      case "price-desc":
        return b.price - a.price; // Price high to low
      case "rating-desc":
        return (b.rating || 0) - (a.rating || 0); // Rating high to low
      case "rating-asc":
        return (a.rating || 0) - (b.rating || 0); // Rating low to high
      default:
        return 0; // No sorting
    }
  });
}
```

### 4. Filter Sidebar Components

**Location Filter with Search:**
```jsx
// FilterSidebar.jsx - Location filtering with search capability
const FilterSidebar = ({ locations, selectedLocations, setSelectedLocations }) => {
  const [locationSearch, setLocationSearch] = useState('');

  // Filter locations based on search input
  const filteredLocations = locations?.filter(location => 
    location.name.toLowerCase().includes(locationSearch.toLowerCase())
  ) || [];

  // Toggle location selection
  const handleLocationToggle = (locationId) => {
    if (selectedLocations.includes(locationId)) {
      setSelectedLocations(selectedLocations.filter(id => id !== locationId));
    } else {
      setSelectedLocations([...selectedLocations, locationId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Locations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Search Input */}
        <Input
          type="text"
          placeholder="Search locations..."
          value={locationSearch}
          onChange={(e) => setLocationSearch(e.target.value)}
        />
        
        {/* Selected Location Chips */}
        {selectedLocations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedLocations.map(locationId => {
              const location = locations?.find(l => l._id === locationId);
              return location ? (
                <Badge key={locationId} variant="secondary">
                  {location.name}
                  <X onClick={() => removeLocation(locationId)} />
                </Badge>
              ) : null;
            })}
          </div>
        )}
        
        {/* Location Checkboxes */}
        <div className="max-h-48 overflow-y-auto space-y-2">
          {filteredLocations.map(location => (
            <label key={location._id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLocations.includes(location._id)}
                onChange={() => handleLocationToggle(location._id)}
              />
              <span>{location.name}</span>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
```

**Price Range Filter with Dual Controls:**
```jsx
// FilterSidebar.jsx - Price range with slider and manual input
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <DollarSign className="w-5 h-5" />
      Price Range
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Manual Input Fields */}
    <div className="flex gap-2 mb-3">
      <div className="flex-1">
        <label className="text-xs text-gray-500">Min</label>
        <Input
          type="number"
          value={priceRange[0]}
          onChange={(e) => {
            const newMin = Math.max(0, Math.min(Number(e.target.value), priceRange[1]));
            setPriceRange([newMin, priceRange[1]]);
          }}
        />
      </div>
      <div className="flex-1">
        <label className="text-xs text-gray-500">Max</label>
        <Input
          type="number"
          value={priceRange[1]}
          onChange={(e) => {
            const newMax = Math.max(priceRange[0], Math.min(1000, Number(e.target.value)));
            setPriceRange([priceRange[0], newMax]);
          }}
        />
      </div>
    </div>
    
    {/* Range Slider */}
    <Slider
      value={priceRange}
      onValueChange={setPriceRange}
      max={1000}
      min={0}
      step={10}
      className="w-full"
    />
  </CardContent>
</Card>
```

**Star Rating Filter:**
```jsx
// FilterSidebar.jsx - Star rating with visual stars
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Star className="w-5 h-5" />
      Star Rating
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map(rating => (
        <label key={rating} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="starRating"
            value={rating}
            checked={starRating === rating}
            onChange={(e) => setStarRating(Number(e.target.value))}
          />
          <div className="flex items-center gap-1">
            {Array.from({ length: rating }, (_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-sm">& up</span>
          </div>
        </label>
      ))}
      
      {/* Any Rating Option */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="starRating"
          value=""
          checked={starRating === null}
          onChange={() => setStarRating(null)}
        />
        <span className="text-sm">Any rating</span>
      </label>
    </div>
  </CardContent>
</Card>
```

### 5. Pagination System

**Client-Side Pagination Logic:**
```javascript
// hotels-listing.page.jsx - Pagination with filter integration
const itemsPerPage = 15;
const [currentPage, setCurrentPage] = useState(1);

// Calculate pagination after filtering and sorting
const totalPages = Math.ceil((filteredHotels?.length || 0) / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedHotels = filteredHotels?.slice(startIndex, endIndex);

// Reset to page 1 when filters change
useEffect(() => {
  setCurrentPage(1);
}, [selectedLocations, searchQuery, sortBy, priceRange, starRating]);

// Pagination Controls
{totalPages > 1 && (
  <div className="flex items-center justify-center gap-2 mt-8">
    <Button
      variant="outline"
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
    >
      <ChevronLeft className="w-4 h-4" />
    </Button>
    
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <Button
        key={page}
        variant={currentPage === page ? "default" : "outline"}
        onClick={() => setCurrentPage(page)}
      >
        {page}
      </Button>
    ))}
    
    <Button
      variant="outline"
      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
    >
      <ChevronRight className="w-4 h-4" />
    </Button>
  </div>
)}
```

### 6. View Mode Toggle

**Grid vs List Display:**
```jsx
// hotels-listing.page.jsx - Dynamic view modes
const [viewMode, setViewMode] = useState("grid");

// View Toggle Controls
<div className="flex items-center gap-2">
  <Button
    variant={viewMode === "grid" ? "default" : "outline"}
    onClick={() => setViewMode("grid")}
  >
    <Grid className="w-4 h-4" />
  </Button>
  <Button
    variant={viewMode === "list" ? "default" : "outline"}
    onClick={() => setViewMode("list")}
  >
    <List className="w-4 h-4" />
  </Button>
</div>

// Conditional Rendering
<div className={
  viewMode === "grid"
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    : "space-y-4"
}>
  {paginatedHotels?.map((hotel) =>
    viewMode === "grid" ? (
      <HotelCard key={hotel._id} hotel={hotel} />
    ) : (
      <HotelListItem key={hotel._id} hotel={hotel} />
    )
  )}
</div>
```

### 7. Filter State Management

**Clear Filters Functionality:**
```javascript
// hotels-listing.page.jsx - Reset all filters
const handleClearFilters = () => {
  setSelectedLocations([]);      // Clear location selections
  setPriceRange([0, 1000]);     // Reset price range to full range
  setStarRating(null);           // Clear star rating filter
  setSearchQuery("");           // Clear search query
  setSortBy("name-asc");        // Reset to default sort
};
```

### 8. Performance Optimizations

**Efficient Filtering Strategy:**
- **Client-Side Processing**: All filtering done in browser for instant results
- **Memoization**: Filter results cached until dependencies change
- **Lazy Loading**: Images loaded on demand with LazyImage component
- **Pagination**: Only render visible items to improve performance
- **Debounced Search**: Search input could be debounced for better UX

### 9. User Experience Features

**Interactive Elements:**
- **Real-time Updates**: Filters apply immediately without page refresh
- **Visual Feedback**: Selected filters shown as badges
- **Search Highlighting**: Search terms could be highlighted in results
- **Empty States**: Friendly messages when no results found
- **Loading States**: Skeleton loaders during data fetch
- **Responsive Design**: Works on all device sizes

### 10. Filter Logic Benefits

**Advantages of Current Implementation:**
- **Fast Response**: Client-side filtering provides instant results
- **Multiple Filters**: Combine different filter types seamlessly
- **Intuitive UI**: Clear visual indicators for active filters
- **Flexible Sorting**: Multiple sort criteria available
- **Scalable Design**: Easy to add new filter types
- **State Persistence**: Filter state maintained during navigation

**Potential Enhancements:**
- **URL Parameters**: Persist filters in URL for sharing/bookmarking
- **Advanced Search**: Full-text search across all hotel fields
- **Filter Presets**: Save common filter combinations
- **Server-Side Filtering**: For larger datasets with pagination
- **Filter Analytics**: Track popular filter combinations