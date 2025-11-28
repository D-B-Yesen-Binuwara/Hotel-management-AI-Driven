import express from "express";
import { createBooking, getUserBookings } from "../application/booking";
import isAuthenticated from "./middleware/authentication-middleware";

const bookingRouter = express.Router();

bookingRouter.use(isAuthenticated);

bookingRouter.route("/").post(createBooking);
bookingRouter.route("/user").get(getUserBookings);

export default bookingRouter;