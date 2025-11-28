import Location from "../infrastructure/entities/Location";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { Request, Response, NextFunction } from "express";

export const getAllLocations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
    return;
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const locationData = req.body;
    if (!locationData.name) {
      throw new ValidationError("Location name is required");
    }
    await Location.create(locationData);
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

export const getLocationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const location = await Location.findById(_id);
    if (!location) {
      throw new NotFoundError("Location not found");
    }
    res.status(200).json(location);
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const locationData = req.body;
    if (!locationData.name) {
      throw new ValidationError("Location name is required");
    }

    const location = await Location.findById(_id);
    if (!location) {
      throw new NotFoundError("Location not found");
    }

    await Location.findByIdAndUpdate(_id, locationData);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const patchLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const locationData = req.body;
    if (!locationData.name) {
      throw new ValidationError("Location name is required");
    }
    const location = await Location.findById(_id);
    if (!location) {
      throw new NotFoundError("Location not found");
    }
    await Location.findByIdAndUpdate(_id, { name: locationData.name });
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const deleteLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const location = await Location.findById(_id);
    if (!location) {
      throw new NotFoundError("Location not found");
    }
    await Location.findByIdAndDelete(_id);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};
