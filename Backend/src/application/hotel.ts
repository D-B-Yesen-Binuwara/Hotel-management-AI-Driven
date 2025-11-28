import Hotel from "../infrastructure/entities/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { generateEmbedding } from "./utils/embeddings";

import { CreateHotelDTO, SearchHotelDTO } from "../domain/dtos/hotel";

import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export const getAllHotels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
    return;
  } catch (error) {
    next(error);
  }
};

export const getAllHotelsBySearchQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = SearchHotelDTO.safeParse(req.query);
    if (!result.success) {
      throw new ValidationError(`${result.error.message}`);
    }
    const { query } = result.data;

    const queryEmbedding = await generateEmbedding(query);

    const hotels = await Hotel.aggregate([
      {
        $vectorSearch: {
          index: "hotel_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 25,
          limit: 4,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          location: 1,
          price: 1,
          image: 1,
          rating: 1,
          reviews: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    res.status(200).json(hotels);
  } catch (error) {
    next(error);
  }
};

export const createHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelData = req.body;
    const result = CreateHotelDTO.safeParse(hotelData);

    if (!result.success) {
      throw new ValidationError(`${result.error.message}`);
    }

    const embedding = await generateEmbedding(
      `${result.data.name} ${result.data.description} ${result.data.location} ${result.data.price}`
    );

    let stripePriceId = null;
    
    // Create Stripe product only if Stripe is configured
    if (stripe) {
      try {
        const product = await stripe.products.create({
          name: result.data.name,
          description: result.data.description,
          default_price_data: {
            unit_amount: Math.round(result.data.price * 100), // Convert to cents
            currency: "usd",
          },
        });
        stripePriceId = product.default_price as string;
      } catch (error) {
        console.warn("Failed to create Stripe product:", error);
      }
    }

    await Hotel.create({ ...result.data, embedding, stripePriceId });
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

export const getHotelById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }
    res.status(200).json(hotel);
  } catch (error) {
    next(error);
  }
};

export const updateHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const hotelData = req.body;
    if (
      !hotelData.name ||
      !hotelData.image ||
      !hotelData.location ||
      !hotelData.price ||
      !hotelData.description
    ) {
      throw new ValidationError("Invalid hotel data");
    }

    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }

    await Hotel.findByIdAndUpdate(_id, hotelData);
    res.status(200).json(hotelData);
  } catch (error) {
    next(error);
  }
};

export const patchHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const hotelData = req.body;
    if (!hotelData.price) {
      throw new ValidationError("Price is required");
    }
    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }
    await Hotel.findByIdAndUpdate(_id, { price: hotelData.price });
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const deleteHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }
    await Hotel.findByIdAndDelete(_id);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};
