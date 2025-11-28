import Booking from "../infrastructure/entities/Booking";
import Hotel from "../infrastructure/entities/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { CreateBookingDTO } from "../domain/dtos/hotel";
import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

const generateRoomNumber = async (): Promise<number> => {
  const lastBooking = await Booking.findOne().sort({ roomNumber: -1 });
  return lastBooking ? lastBooking.roomNumber + 1 : 101;
};

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      throw new ValidationError("User authentication required");
    }

    const result = CreateBookingDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(`${result.error.message}`);
    }

    const { hotelId, checkIn, checkOut } = result.data;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }

    const roomNumber = await generateRoomNumber();

    // Calculate total amount (number of nights * hotel price)
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const numberOfNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = numberOfNights * hotel.price;

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

export const getUserBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      throw new ValidationError("User authentication required");
    }

    const bookings = await Booking.find({ userId: auth.userId })
      .populate("hotelId")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};