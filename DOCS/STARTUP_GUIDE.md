# 🚀 Hotel Management Platform - Startup Guide

## Quick Start

### 1. Start Backend Server
```bash
cd Backend
npm install
npm run dev
```
**Expected output:** `Server is listening on PORT: 5080`

### 2. Start Frontend Server
```bash
cd Frontend  
npm install
npm run dev
```
**Expected output:** `Local: http://localhost:5173/`

## 🔧 Fix Common Issues

### Backend Connection Errors
If you see "Failed to load resource: net::ERR_CONNECTION_REFUSED":
- ✅ Make sure backend is running on port 5080
- ✅ Check MongoDB connection in backend console

### Stripe Integration Errors
If you see Stripe errors:
- ✅ Add real Stripe keys to `.env` files (currently using placeholders)
- ✅ For development, you can ignore Stripe errors if not testing payments

### MongoDB Vector Search (for AI Search)
- ✅ Create vector search index in MongoDB Atlas (see TASK_5_SETUP.md)
- ✅ Index name: `hotel_vector_index`
- ✅ Collection: `hotels`

## 🎯 Test Features

1. **Browse Hotels** - Should load automatically
2. **AI Search** - Enter "luxury beachfront hotel" 
3. **Clear Search** - Use buttons or press Escape
4. **Account Features** - Sign up/login with Clerk
5. **Booking Flow** - Select hotel → Book → Payment (needs Stripe setup)

## 📝 Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=sk-proj-... ✅ (Already configured)
MONGODB_URL=mongodb+srv://... ✅ (Already configured)  
CLERK_SECRET_KEY=sk_test_... ✅ (Already configured)
STRIPE_SECRET_KEY=sk_test_... ⚠️ (Placeholder - add real key)
```

### Frontend (.env)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_... ✅ (Already configured)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... ⚠️ (Placeholder - add real key)
```

## ✅ All Tasks Status

- ✅ **Task 1**: Booking & Payment System (needs real Stripe keys)
- ✅ **Task 2**: My Account & Booking History  
- ✅ **Task 3**: UI/UX Customization & Brand Identity
- ✅ **Task 4**: Hotel Listing with Advanced Filtering
- ✅ **Task 5**: AI Search with Clear & Reset Functionality

Ready to use! 🎉