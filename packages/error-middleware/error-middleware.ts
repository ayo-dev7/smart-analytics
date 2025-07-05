import { NextFunction, Request, Response } from "express";
import { AppError } from ".";
import logger from "../logger/logger";

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof AppError) {
        logger.error(`Error ${req.method} ${req.url} - ${err.message}`);

        return res.status(err.statusCode).json({
            status: "error",
            message: err.message,
            ...(err.details && {details: err.details})
        })
    }

    logger.error(`Unhandled error: ${err}`);
    return res.status(500).json({
        error: "Something went wrong, please try again"
    })
}