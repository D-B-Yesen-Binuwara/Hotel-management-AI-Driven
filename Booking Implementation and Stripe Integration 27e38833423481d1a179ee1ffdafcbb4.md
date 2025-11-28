# Booking Implementation and Stripe Integration

---

This guide explains in depth how Stripe is integrated in this project, step-by-step, with API examples and dashboard instructions. It targets developers familiar with REST APIs and React.

- Backend: `aidf-5-back-end` (Node/Express/Mongoose/Clerk)
- Frontend: `aidf-5-front-end` (React, RTK Query, Clerk, Stripe Embedded Checkout)

---

## Understanding Stripe Payment Architecture

### High-Level Payment Flow

Stripe payment systems typically follow this pattern:

1. **Product Catalog**: Define what you're selling (products/prices)
    1. **Payable Entity Creation**: Create a record representing what the user is purchasing
2. **Payment Intent**: Create a payment session when user wants to pay
3. **Payment Collection**: Use Stripe's UI components to collect payment
4. **Payment Processing**: Stripe handles the actual payment processing
5. **State Transition**: Update the payable entity's payment status on successful completion

### Core Payment Concept: Payable Entities

**What is a Payable Entity?**
A payable entity is a database record that represents something a user is purchasing. It serves as the bridge between your business logic and the payment system.

**Key Characteristics:**

- **Linked to User**: Every payable entity belongs to a specific user
- **Linked to Product/Service**: Represents what the user is buying
- **Payment State**: Tracks the payment status (PENDING, PAID, FAILED, etc.)
- **Unique Identifier**: Used to reconcile payments with business records

**Examples of Payable Entities:**

- **Booking**: Hotel room reservation (our case)
- **Order**: E-commerce purchase
- **Subscription**: Recurring service
- **Invoice**: Service billing

### Payment State Management Flow

The payment integration follows this state-driven approach:

```
1. CREATE PAYABLE ENTITY
   User initiates purchase → Create payable entity with PENDING status

2. INITIATE PAYMENT
   User clicks "Pay" → Create Stripe payment session with entity metadata

3. PAYMENT PROCESSING
   User completes payment → Stripe processes the transaction

4. STATE TRANSITION
   Payment succeeds → Update payable entity to PAID status
   Payment fails → Update payable entity to FAILED status

```

**Why This Pattern?**

- **Reliability**: Payment processing is asynchronous - users might close their browser
- **Audit Trail**: Every transaction is tracked in your database
- **Business Logic**: You can enforce business rules based on payment status
- **Reconciliation**: Easy to match Stripe payments with your records

### Our Implementation: Booking as Payable Entity

In our hotel booking system:

**Booking Entity Structure:**

```tsx
{
  _id: "booking_123",
  userId: "user_456",           // Links to user
  hotelId: "hotel_789",         // Links to product/service
  checkIn: "2024-01-15",
  checkOut: "2024-01-17",
  roomNumber: "101",
  paymentStatus: "PENDING",     // Payment state
  paymentMethod: "CARD",
}

```

**Payment Flow:**

1. **Create Booking**: User selects dates → Create booking with `paymentStatus: "PENDING"`
2. **Initiate Payment**: User clicks "Pay" → Create Stripe Checkout Session with `bookingId` in metadata
3. **Process Payment**: Stripe handles payment collection and processing
4. **Update Status**: Webhook receives `checkout.session.completed` → Update booking to `paymentStatus: "PAID"`

**State Transitions:**

- `PENDING` → `PAID`: Payment successful
- `PENDING` → `FAILED`: Payment failed or expired
- `PAID` → `REFUNDED`: Refund processed (future enhancement)

### Payment Status Lifecycle

```
PENDING (Initial State)
    ↓
    ├─ Payment Success → PAID
    ├─ Payment Failed → FAILED
    └─ Payment Expired → EXPIRED

```

**Business Rules Based on Status:**

- `PENDING`: Booking exists but not confirmed, can be cancelled
- `PAID`: Booking confirmed, room reserved, user can check in
- `FAILED`: Booking invalid, user must retry payment
- `EXPIRED`: Booking expired, user must create new booking

### Metadata Linking Strategy

**Why Metadata?**
Stripe webhooks don't know about your business entities. Metadata creates the link:

```tsx
// When creating Checkout Session (from payment.ts)
const session = await stripe.checkout.sessions.create({
  ui_mode: "embedded",
  line_items: [lineItem],
  mode: "payment",
  return_url: `${FRONTEND_URL}/booking/complete?session_id={CHECKOUT_SESSION_ID}`,
  metadata: {
    bookingId: booking._id.toString(),  // Links Stripe session to our booking
  },
});

// In webhook handler (from payment.ts)
const booking = await Booking.findById(checkoutSession.metadata?.bookingId);
if (checkoutSession.payment_status !== "unpaid") {
  await Booking.findByIdAndUpdate(booking._id, { paymentStatus: "PAID" });
}

```

### Error Handling & Edge Cases

**Duplicate Payments:**

- User clicks "Pay" multiple times → Create multiple sessions for same booking
- Solution: Check if booking already has `PAID` status before creating session

**Webhook Failures:**

- Stripe webhook fails → Booking stays `PENDING` but payment succeeded
- Solution: Implement status polling as backup, retry webhook processing

**Race Conditions:**

- User completes payment while webhook is processing
- Solution: Use database transactions, idempotent webhook handlers

**Payment Expiration:**

- User abandons payment → Session expires
- Solution: Implement cleanup job to mark expired bookings as `EXPIRED`

### Key Concepts

### Products & Prices

- **Product**: Represents a sellable item (e.g., "Hotel Room")
- **Price**: Defines how much to charge (e.g., "$100/night")
- Products can have multiple prices (different currencies, billing intervals)

### Checkout Sessions: The Payment Bridge

**What is a Checkout Session?**
A Checkout Session is Stripe's way of creating a secure payment experience. Think of it as a "payment container" that holds all the information needed to process a payment for a specific payable entity.

**Key Characteristics:**

- **Temporary**: Sessions expire after 24 hours (configurable)
- **Secure**: Handles PCI compliance and sensitive payment data
- **Stateful**: Tracks payment progress (open, complete, expired)
- **Linked**: Connected to your payable entity via metadata

**How Checkout Sessions Relate to Payable Entities:**

```
Payable Entity (Booking)          Checkout Session (Stripe)
┌─────────────────────────┐      ┌─────────────────────────┐
│ _id: "booking_123"      │ ──── │ id: "cs_stripe_456"     │
│ userId: "user_789"      │      │ client_secret: "cs_..." │
│ hotelId: "hotel_101"    │      │ status: "open"           │
│ paymentStatus: "PENDING"│      │ metadata: {             │
│ stripeSessionId: null   │      │   bookingId: "123"      │
└─────────────────────────┘      │   userId: "789"         │
                                 │ }                       │
                                 └─────────────────────────┘

```

**Session Lifecycle:**

1. **Created**: When user clicks "Pay" → Session created with `status: "open"`
2. **Active**: User fills payment form → Session remains `status: "open"`
3. **Completed**: Payment succeeds → Session becomes `status: "complete"`
4. **Expired**: User abandons → Session becomes `status: "expired"`

**Why Use Checkout Sessions?**

- **PCI Compliance**: Stripe handles sensitive payment data
- **User Experience**: Pre-built, tested payment forms
- **Security**: Built-in fraud protection and 3D Secure
- **Reliability**: Handles edge cases (network issues, browser crashes)

**Session Types:**

- **Hosted Checkout**: Redirects user to Stripe's payment page
- **Embedded Checkout**: Renders payment form within your app (our choice)

**Our Implementation Flow:**

```
1. User creates booking (PENDING status)
   ↓
2. User clicks "Pay" → Create Checkout Session
   ↓
3. Frontend renders embedded checkout form
   ↓
4. User completes payment → Session status: "complete"
   ↓
5. Webhook fires → Update booking status: "PAID"

```

**Code Example - Creating a Session:**

```tsx
// Backend: Create Checkout Session (from payment.ts)
const session = await stripe.checkout.sessions.create({
  ui_mode: "embedded",
  line_items: [lineItem],
  mode: "payment",
  return_url: `${FRONTEND_URL}/booking/complete?session_id={CHECKOUT_SESSION_ID}`,
  metadata: {
    bookingId: booking._id.toString(),
  },
});

res.send({ clientSecret: session.client_secret });

```

**Code Example - Using Session in Frontend:**

```jsx
// Frontend: Render embedded checkout (from CheckoutForm.jsx)
const fetchClientSecret = useCallback(async () => {
  const token = await getToken();
  const res = await fetch(
    `${BACKEND_URL}/api/payments/create-checkout-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookingId }),
    }
  );
  const data = await res.json();
  return data.clientSecret;
}, [bookingId, getToken]);

return (
  <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
    <EmbeddedCheckout />
  </EmbeddedCheckoutProvider>
);

```

**Session vs Payment Intent:**

- **Checkout Session**: Higher-level, includes UI, handles complex flows (what we use)
- **Payment Intent**: Lower-level, custom UI, more control but more complexity (we don't use this)

**Why We Use Checkout Sessions (Not Payment Intents):**

- **Simpler Integration**: Less code, fewer edge cases to handle
- **Built-in UI**: Stripe provides the payment form, we just embed it
- **PCI Compliance**: Stripe handles all sensitive payment data
- **SCA Support**: Automatic Strong Customer Authentication handling
- **Error Handling**: Stripe manages payment failures and retries

**Session Metadata Strategy:**

```tsx
// Essential metadata for webhook processing (from payment.ts)
metadata: {
  bookingId: booking._id.toString(),  // Primary link to payable entity
}

```

**Session Status Handling:**

```tsx
// Webhook handler (from payment.ts)
if (
  event.type === "checkout.session.completed" ||
  event.type === "checkout.session.async_payment_succeeded"
) {
  await fulfillCheckout((event.data.object as any).id);
  res.status(200).send();
  return;
}

// fulfillCheckout function
async function fulfillCheckout(sessionId: string) {
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });

  const booking = await Booking.findById(checkoutSession.metadata?.bookingId);
  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.paymentStatus !== "PENDING") {
    return; // already handled
  }

  if (checkoutSession.payment_status !== "unpaid") {
    await Booking.findByIdAndUpdate(booking._id, { paymentStatus: "PAID" });
  }
}

```

### Payment Sessions

- **Checkout Session**: Stripe's hosted payment page (redirect or embedded) - **This is what we use**
- **Payment Intent**: For custom payment flows with your own UI - **We don't use this**
- **Client Secret**: A token that allows frontend to complete payment securely

### Webhooks

**What are Webhooks?**
Webhooks are HTTP callbacks that Stripe sends to your server when events occur. Think of them as "push notifications" from Stripe to your backend.

**Why Webhooks?**

- **Reliability**: Payment processing is asynchronous - users might close their browser before payment completes
- **Security**: Server-to-server communication ensures payment events can't be spoofed
- **Real-time Updates**: Your database stays synchronized with Stripe's payment status

**Common Webhook Events:**

- `checkout.session.completed` - Payment successful
- `payment_intent.succeeded` - Payment processed
- `invoice.payment_failed` - Payment failed
- `customer.subscription.created` - Subscription started

### Security Model

- **Publishable Key**: Safe for frontend (identifies your Stripe account)
- **Secret Key**: Server-only (can create charges, access sensitive data)
- **Webhook Secret**: Validates webhook authenticity (prevents fake events)

### Payment Architecture Patterns

### Pattern 1: Hosted Checkout (What we use)

```
Frontend → Backend → Stripe Checkout → User pays → Webhook → Backend updates DB

```

- **Pros**: PCI compliant, handles complex flows (SCA, 3D Secure)
- **Cons**: Less customization, redirects user away

### Pattern 2: Embedded Checkout (What we use)

```
Frontend (with Stripe.js) → Backend → Stripe API → Embedded UI → Webhook → Backend

```

- **Pros**: Stays in your app, still PCI compliant
- **Cons**: More complex integration

### Pattern 3: Custom Payment Flow

```
Frontend (custom UI) → Backend → Payment Intent → Frontend confirms → Webhook

```

- **Pros**: Full control over UI
- **Cons**: Must handle PCI compliance, SCA, error states

### Webhook Handling Best Practices

1. **Idempotency**: Handle duplicate webhook events gracefully
2. **Signature Verification**: Always verify webhook signatures
3. **Async Processing**: Don't block webhook response with heavy operations
4. **Retry Logic**: Stripe retries failed webhooks, so make your endpoint idempotent
5. **Event Ordering**: Events may arrive out of order - design for eventual consistency

### Our Implementation Strategy

We use **Embedded Checkout** because:

- Users stay within our React app
- Stripe handles PCI compliance and SCA
- We get real-time payment status updates
- Simpler than custom payment flows

**Our Flow:**

1. User books hotel → Create booking with `PENDING` status
2. User clicks "Pay" → Create Checkout Session with booking metadata
3. Stripe renders embedded payment form
4. Payment completes → Webhook updates booking to `PAID`
5. User sees confirmation page

---

> Before you begin
> 
> - Follow your deployment guide to deploy the backend and frontend first.
> - You will need the deployed backend base URL (referred to as BACKEND_URL) to configure the Stripe webhook destination as `${BACKEND_URL}/api/stripe/webhook`.

---

## Architecture overview

1. A user books a hotel via `POST /api/bookings`. We capture `userId` from Clerk using `getAuth(req)`.
2. The app creates a Stripe Product with a default Price for each hotel. This happens in two places:
    - Automatically when creating a hotel via API.
    - During seeding, sequentially with a small delay to avoid rate limits.
3. To pay for a booking, the frontend requests a Checkout Session from `POST /api/payments/create-checkout-session`.
4. The backend returns a `client_secret`. The frontend embeds Stripe’s Checkout using this secret.
5. When payment completes, Stripe redirects back to `/booking/complete?session_id=...`.
6. The frontend calls `GET /api/payments/session-status` to show a confirmation view. The backend also handles a webhook at `/api/stripe/webhook` to mark bookings as PAID.

---

## Core Stripe concepts used (with rationale)

- Product: Represents a sellable item. We create a product per hotel so pricing can be reused across bookings.
- Price: Represents how much is charged. We attach a default price to each product (USD; nightly rate in cents). This lets us pass a simple Price ID when creating Checkout Sessions.
- Checkout Session (Embedded): Stripe’s hosted payment UI integrated within our page. We use `ui_mode: "embedded"` to keep the user within our SPA while Stripe handles PCI compliance and SCA.
- Metadata: We attach `bookingId` to the Checkout Session so webhooks/status can link payment events back to the booking.
- Webhooks: Server-to-server notifications from Stripe. We validate the signature (`STRIPE_WEBHOOK_SECRET`) and update the booking’s `paymentStatus` = `PAID`.
- Keys: Backend uses `STRIPE_SECRET_KEY` (server-only). Frontend uses `VITE_STRIPE_PUBLISHABLE_KEY` to initialize Stripe.js.

---

## Prerequisites

**Important:** Follow the deployment guide first to set up your backend and frontend applications. The deployment guide has already configured all necessary environment variables except for the Stripe-related ones listed below.

### New Environment Variables

Backend (`aidf-5-back-end/.env`):

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

```

Frontend (`aidf-5-front-end/.env.local`):

```
VITE_STRIPE_PUBLISHABLE_KEY=

```

Notes:

- Never expose `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` to the client.

---

## Stripe Dashboard: step-by-step

1. Get keys
    - Dashboard → Developers → API keys
    - Copy Publishable key (frontend) and Secret key (backend).
2. Create a webhook endpoint
    - Dashboard → Developers → Webhooks → Add endpoint
    - Endpoint URL: `${BACKEND_URL}/api/stripe/webhook` (your deployed backend URL + `/api/stripe/webhook`)
    - Select events:
        - `checkout.session.completed`
        - `checkout.session.async_payment_succeeded`
    - Save and copy the "Signing secret" and set `STRIPE_WEBHOOK_SECRET` in `.env`.

---

## Data model changes

- `Hotel`:
    - `stripePriceId: string` (default Price ID for the hotel’s Product). Mandatory for checkout in our implementation.
- `Booking`:
    - `paymentStatus: "PENDING" | "PAID"` (created as `PENDING`, becomes `PAID` after payment)

---

## Backend implementation details

### 1) Creating a hotel: Product + default Price

- File: `aidf-5-back-end/src/application/hotel.ts` (function `createHotel`)
- After validating input and generating an embedding, we call:

```tsx
const product = await stripe.products.create({
  name: result.data.name,
  description: result.data.description,
  default_price_data: {
    unit_amount: Math.round(result.data.price * 100),
    currency: "usd",
  },
});

```

- We extract `default_price` from the product and store it as `stripePriceId` on the `Hotel` record.

Admin re-setup endpoint:

- `POST /api/hotels/:_id/stripe/price` → Recreates a product with `default_price_data` for a hotel and updates `stripePriceId`.

### 2) Seeding hotels and creating Stripe products sequentially

- File: `aidf-5-back-end/src/seed.ts`
- After inserting hotels, we loop over each hotel:
    - Create Stripe product with `default_price_data`
    - Store `stripePriceId` on the hotel
    - Wait ~300ms between requests to avoid 429 rate limits.

### 3) Creating a booking (user attribution)

- File: `aidf-5-back-end/src/application/booking.ts` → `createBooking`
- Extract user using Clerk:

```tsx
const { userId } = getAuth(req);
if (!userId) {
  throw new UnauthorizedError("Unauthorized");
}

```

- Create the booking with `PENDING` payment status.

### 4) Starting a Checkout Session (Embedded)

- File: `aidf-5-back-end/src/application/payment.ts` → `createCheckoutSession`
- For a booking with check-in/out dates, we compute number of nights and create:

```tsx
if (!hotel.stripePriceId) {
  return res.status(400).json({ message: "Stripe price ID is missing for this hotel" });
}
const session = await stripe.checkout.sessions.create({
  ui_mode: "embedded",
  line_items: [{ price: hotel.stripePriceId, quantity: numberOfNights }],
  mode: "payment",
  return_url: `${FRONTEND_URL}/booking/complete?session_id={CHECKOUT_SESSION_ID}`,
  metadata: { bookingId: booking._id.toString() },
});

```

- We intentionally do not use `price_data` here; a price ID and quantity are sufficient.

Example request:

```
POST /api/payments/create-checkout-session
Authorization: Bearer <clerk-jwt>
Content-Type: application/json

{ "bookingId": "<mongo_id>" }

```

Example response:

```
{ "clientSecret": "cs_test_..." }

```

### 5) Retrieving session status (and idempotent mark as PAID)

- File: `aidf-5-back-end/src/application/payment.ts` → `retrieveSessionStatus`
- `GET /api/payments/session-status?session_id=...`
- Returns `{ booking, hotel, status, customer_email, paymentStatus }` and updates booking to `PAID` if the session is paid.

### 6) Webhook verification and fulfillment

- Files:
    - `aidf-5-back-end/src/index.ts` (register raw-body route BEFORE JSON parser)
    - `aidf-5-back-end/src/application/payment.ts` (`handleWebhook`, `fulfillCheckout`)
- Route registration:

```tsx
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

```

- The webhook destination in Stripe Dashboard must point to your deployed backend: `${BACKEND_URL}/api/stripe/webhook`.
- Handler (simplified):

```tsx
const event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
  await fulfillCheckout((event.data.object as any).id);
}

```

- `fulfillCheckout` retrieves the session, reads `metadata.bookingId`, and sets the booking’s `paymentStatus` to `PAID`.

Security notes:

- Webhook route must NOT use `express.json()`; it must receive the raw body.
- Always verify the signature (`STRIPE_WEBHOOK_SECRET`).

---

## Frontend implementation details

### 1) API layer

- File: `aidf-5-front-end/src/lib/api.js`
- Exposes RTK Query endpoints:
    - `createBooking` (POST `bookings`)
    - `getBookingById` (GET `bookings/:id`)
    - `createCheckoutSession` (POST `payments/create-checkout-session`)
    - `getCheckoutSessionStatus` (GET `payments/session-status?session_id=...`)
- Uses Clerk token authentication in `prepareHeaders`

### 2) Embedded Checkout component

- File: `aidf-5-front-end/src/components/CheckoutForm.jsx`
- Loads Stripe with `VITE_STRIPE_PUBLISHABLE_KEY` and fetches the `clientSecret` from the backend using the Clerk token.
- Renders `<EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>` and `<EmbeddedCheckout />`.

### 3) Booking flow pages

- `hotel-details.page.jsx`: launches `BookingDialog` and then navigates to `/booking/payment?bookingId=...`.
- `payment.page.jsx`: renders `CheckoutForm`.
- `complete.page.jsx`: reads `session_id` and calls `getCheckoutSessionStatus`, then shows a success view.

---

## Local development steps

1. Configure env files for both backend and frontend (see above).
2. Install dependencies in both apps (already in repo, but run `npm i` if needed).
3. Start backend:

```
cd aidf-5-back-end
npm run dev

```

1. Start frontend:

```
cd aidf-5-front-end
npm run dev

```

1. Seed data (optional):

```
cd aidf-5-back-end
npm run seed

```

1. In the browser:
    - Go to a hotel details page → Book Now → pick dates → submit.
    - Redirected to `/booking/payment` → Embedded Checkout loads.
    - Complete payment with test card (e.g., `4242 4242 4242 4242`, future expiry, any CVC).
    - Redirect to `/booking/complete?session_id=...` → see confirmation.

---

## Production checklist

- Set `FRONTEND_URL` to the deployed frontend.
- Configure a production webhook endpoint to your deployed backend.
- Store secrets in your platform’s secret manager (e.g., Vercel/Netlify/Render/AWS/GCP).
- Use HTTPS in production for webhook and app URLs.
- Rotate keys regularly in Stripe Dashboard.
- Monitor failed webhooks and 4xx from your endpoint.

---

## Troubleshooting

- Embedded Checkout not rendering: ensure `VITE_STRIPE_PUBLISHABLE_KEY` is valid and the `create-checkout-session` call succeeds with a `clientSecret`.
- 401/403 from backend: ensure Clerk token is present (frontend `prepareHeaders` waits for Clerk) and role checks are satisfied for admin routes.
- Webhook 400 “No signatures found” or “Invalid payload”: confirm the route uses raw body, the endpoint URL matches Stripe Dashboard, and `STRIPE_WEBHOOK_SECRET` is correct.
- Seeding 429 rate limits: increase the delay between Stripe product creations (currently ~300ms) or run in batches.
- Missing price: use admin route `POST /api/hotels/:_id/stripe/price` or recreate the hotel; checkout requires `stripePriceId`.

---

## References (current)

- Embedded Checkout: [https://docs.stripe.com/checkout/embedded](https://docs.stripe.com/checkout/embedded)
- Webhooks: [https://docs.stripe.com/webhooks](https://docs.stripe.com/webhooks)
- Checkout Sessions API: [https://docs.stripe.com/api/checkout/sessions](https://docs.stripe.com/api/checkout/sessions)
- Prices: [https://docs.stripe.com/api/prices](https://docs.stripe.com/api/prices)
- Products: [https://docs.stripe.com/api/products](https://docs.stripe.com/api/products)
- Testing: [https://docs.stripe.com/testing](https://docs.stripe.com/testing)