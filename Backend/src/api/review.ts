import express from "express";
import { createReview, getReviewsForHotel } from "../application/review";
import isAuthenticated from "./middleware/authentication-middleware";

const reviewRouter = express.Router();

reviewRouter.route("/").post(isAuthenticated, createReview);
reviewRouter.route("/hotel/:hotelId").get(isAuthenticated, getReviewsForHotel); //! /api/reviews/hotel/:hotelId

export default reviewRouter;
