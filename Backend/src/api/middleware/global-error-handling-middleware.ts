import NotFoundError from "../../domain/errors/not-found-error";
import ValidationError from "../../domain/errors/validation-error";
import UnauthorizedError from "../../domain/errors/unauthorized-error";
import ForbiddenError from "../../domain/errors/forbidden-error";

import { Request, Response, NextFunction } from "express";

const globalErrorHandlingMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(error);
  if (error.name === "NotFoundError") {
    res.status(404).json({
      message: error.message,
    });
  } else if (error.name === "ValidationError") {
    res.status(400).json({
      message: error.message,
    });
  } else if (error.name === "UnauthorizedError") {
    res.status(401).json({
      message: error.message,
    });
  } else if (error.name === "ForbiddenError") {
    res.status(403).json({
      message: error.message,
    });
  } else {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default globalErrorHandlingMiddleware;
