import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
import dotenv from "dotenv";
import { Request } from "express";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL!);

interface Options {
    windowMs: number;
    max: number;
    keyGenerator?: (req: Request) => string;
    client?: Redis;
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
            }
        }
    }
}

export const createRateLimiter = (options: Options) => {
    return rateLimit({
        store: new RedisStore({
            sendCommand: async(...args: string[]) : Promise<any> => {
                const [command, ...params] = args;
                return await redis.call(command, ...params);
            }
        }),
        windowMs: options.windowMs,
        max: options.max,
        keyGenerator: options.keyGenerator || ((req) => req.ip || "unknown-ip"),
        message: "Too many requests from this IP, please try again later.",
        standardHeaders: true,
        legacyHeaders: false,
    });
}

export const authRateLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyGenerator: (req) => `auth:${req.ip}:${req.body.email}`
});

export const apiRateLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100
});

export const uploadRateLimit = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
    keyGenerator: (req) => `upload:${req.user?.id ?? "anonymous"}`
});

export const getRateLimitCount = async(key: string): Promise<number> => {
    const count = await redis.get(key);
    return count ? parseInt(count) : 0;
}

export const incrementRateLimitCount = async(key: string, windowMs: number) => {
    const exists = await redis.exists(key);

    await redis.incr(key);
    
    if(!exists) {
        await redis.expire(key, Math.ceil(windowMs/1000));
    }
}