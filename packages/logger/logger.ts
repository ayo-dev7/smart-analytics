import winston from "winston";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Define levels for logging
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
}

// Define color for logging
const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    verbose: "cyan",
    debug: "blue",
    silly: "gray"
}

// Define level based on environment
const level = () => {
    const env = process.env.NODE_ENV || "development";
    const isDevelopment = env === "development";
    return isDevelopment ? "debug" : "warn";
}

winston.addColors(colors);

// Create custom format
const format = winston.format.combine(
    winston.format.timestamp({format: "YYYY-MM-DD HH:mm:ss:ms"}),
    winston.format.colorize({all: true}),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Define transports
const transports = [
    new winston.transports.Console(),
    new winston.transports.File({
        filename: path.join("__dirname", "../logs/error.log"),
        level: "error"
    }),
    new winston.transports.File({
        filename: path.join("__dirname", "../logs/combined.log")
    })
]

// Create the logger instance
const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports
});

export default logger;

