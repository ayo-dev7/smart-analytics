import logger from "../logger/logger";
import { User } from "../shared/types";

export interface Context {
    user?: User;
    ip: string;
    userAgent?: string;
    req: any;
    res: any;
    path?: any;
}

export async function createContext(req: any, res: any): Promise<Context> {
    // Extract IP adress
    const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress || "unknown";

    // Extract user agent
    const userAgent = req.headers['user-agent'];

    // Get user from session/token
    const user = await getUserFromRequest(req);

    return {
        user,
        ip: Array.isArray(ip) ? ip[0] : ip,
        userAgent,
        req,
        res
    }
}

async function getUserFromRequest(req: any): Promise<User | undefined> {
    try {
        // Extract token from headers
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer')) {
            return undefined;
        }

        const token = authHeader.substring(7);

        // Verify token and get user
        const user = await verifyTokenAndGetUser(token);
        return user;
    } catch (error){
        logger.error('Error getting user from request')
        return undefined;
    }
}

async function verifyTokenAndGetUser(token:string){
    try{
        // This would typically verify the JWT token and get user from database
        // For now, return a mock user for demonstration
        return {
        id: 'user-123',
        email: 'user@example.com',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        } as User;
    } catch(error){
        logger.error('Error verifying token:', error);
        return undefined;
    }
}