import { z } from "zod";

export const CreateHotelDTO = z.object({
  name: z.string(),
  image: z.string(),
  location: z.string(),
  price: z.number(),
  description: z.string(),
});

export const SearchHotelDTO = z.object({
  query: z.string().min(1),
});

export const CreateBookingDTO = z.object({
  hotelId: z.string().min(1, "Hotel ID is required"),
  checkIn: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid check-in date"),
  checkOut: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid check-out date"),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return checkIn >= today && checkOut > checkIn;
}, {
  message: "Check-out date must be after check-in date and check-in must be today or later",
});
