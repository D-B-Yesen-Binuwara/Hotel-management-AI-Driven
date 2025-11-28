import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import Stripe from "stripe";
import Booking from "../infrastructure/entities/Booking";
import Hotel from "../infrastructure/entities/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!stripe) {
      throw new ValidationError("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
    }

    const auth = getAuth(req);
    if (!auth?.userId) {
      throw new ValidationError("User authentication required");
    }

    const { bookingId } = req.body;
    if (!bookingId) {
      throw new ValidationError("Booking ID is required");
    }

    const booking = await Booking.findById(bookingId).populate("hotelId");
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    if (booking.userId !== auth.userId) {
      throw new ValidationError("Unauthorized access to booking");
    }

    if (booking.paymentStatus === "PAID") {
      throw new ValidationError("Booking is already paid");
    }

    const hotel = booking.hotelId as any;
    if (!hotel.stripePriceId) {
      throw new ValidationError("Stripe price ID is missing for this hotel");
    }

    // Calculate number of nights
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: [
        {
          price: hotel.stripePriceId,
          quantity: numberOfNights,
        },
      ],
      mode: "payment",
      return_url: `${FRONTEND_URL}/booking/complete?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        bookingId: booking._id.toString(),
      },
    });

    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    next(error);
  }
};

export const retrieveSessionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!stripe) {
      throw new ValidationError("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
    }

    const { session_id } = req.query;
    if (!session_id) {
      throw new ValidationError("Session ID is required");
    }

    const session = await stripe.checkout.sessions.retrieve(session_id as string);
    const booking = await Booking.findById(session.metadata?.bookingId).populate("hotelId");
    
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    // Update booking status if payment is complete
    if (session.payment_status !== "unpaid" && booking.paymentStatus === "PENDING") {
      await Booking.findByIdAndUpdate(booking._id, { paymentStatus: "PAID" });
      booking.paymentStatus = "PAID";
    }

    res.json({
      status: session.status,
      customer_email: session.customer_details?.email,
      paymentStatus: booking.paymentStatus,
      booking,
      hotel: booking.hotelId,
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!stripe) {
      console.log("Stripe is not configured, ignoring webhook");
      return res.status(400).send("Stripe is not configured");
    }

    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.log("Stripe webhook secret is not configured");
      return res.status(400).send("Webhook secret not configured");
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await fulfillCheckout((event.data.object as any).id);
    }

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

async function fulfillCheckout(sessionId: string) {
  try {
    if (!stripe) {
      console.error("Stripe is not configured");
      return;
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    const booking = await Booking.findById(checkoutSession.metadata?.bookingId);
    if (!booking) {
      console.error("Booking not found for session:", sessionId);
      return;
    }

    if (booking.paymentStatus !== "PENDING") {
      console.log("Booking already processed:", booking._id);
      return;
    }

    if (checkoutSession.payment_status !== "unpaid") {
      await Booking.findByIdAndUpdate(booking._id, { paymentStatus: "PAID" });
      console.log("Booking marked as PAID:", booking._id);
    }
  } catch (error) {
    console.error("Error fulfilling checkout:", error);
    throw error;
  }
}