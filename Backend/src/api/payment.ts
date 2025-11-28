import express from "express";
import { createCheckoutSession, retrieveSessionStatus } from "../application/payment";
import isAuthenticated from "./middleware/authentication-middleware";

const paymentRouter = express.Router();

paymentRouter.use(isAuthenticated);

paymentRouter.route("/create-checkout-session").post(createCheckoutSession);
paymentRouter.route("/session-status").get(retrieveSessionStatus);

export default paymentRouter;