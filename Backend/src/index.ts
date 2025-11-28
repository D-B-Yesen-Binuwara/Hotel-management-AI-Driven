import "dotenv/config";

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import hotelsRouter from "./api/hotel";
import connectDB from "./infrastructure/db";
import reviewRouter from "./api/review";
import locationsRouter from "./api/location";
import bookingRouter from "./api/booking";
import paymentRouter from "./api/payment";
import { handleWebhook } from "./application/payment";
import globalErrorHandlingMiddleware from "./api/middleware/global-error-handling-middleware";

import { clerkMiddleware } from "@clerk/express";

const app = express();

// Stripe webhook route MUST be before express.json() middleware
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

// Convert HTTP payloads into JS objects
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(clerkMiddleware()); // Reads the JWT from the request and sets the auth object on the request

// app.use((req, res, next) => {
//   console.log(req.method, req.url);
//   next();
// });

app.use("/api/hotels", hotelsRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", paymentRouter);

app.use(globalErrorHandlingMiddleware);

connectDB();

const PORT = process.env.PORT || 5080;
app.listen(PORT, () => {
  console.log("Server is listening on PORT: ", PORT);
});