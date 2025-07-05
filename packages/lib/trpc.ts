import { initTRPC, TRPCError } from "@trpc/server";
import {z} from "zod";
import { Context } from "./context";
import { getRateLimitCount, incrementRateLimitCount } from "../middleware/rate-limiting";
import logger from "../logger/logger";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

// Middleware for authentication
const isAuthenticated = t.middleware(({ctx,next}) => {
    if(!ctx.user) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to access this resource"
        })
    }
    return next({
        ctx: {
            ...ctx,
            user: ctx.user,
        }
    })
});

// Middleware for role-based access control
const hasRole = (requiredRole: string) => t.middleware(({ctx,next}) => {
    if(!ctx.user){
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to access this resource"
        });
    }

    if(ctx.user.role !== requiredRole && ctx.user.role !== "SUPER_ADMIN") {
        throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this resource',
        });
    }

    return next({
        ctx: {
            ...ctx,
            user: ctx.user
        }
    })
});

// Middleware for resource access control
const hasResourceAccess = (resourceType: string, action: string) => t.middleware(async ({ctx,next}) => {
    if(!ctx.user){
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to access this resource"
        });
    }

    // Check if user has access to the specific resource
    const hasAccess = await checkResourceAccess(
        ctx.user.id,
        resourceType,
        // input?.id || input?.resourceId,
        action
    )

    if(!hasAccess) {
        throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this resource',
        });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
});

// Rate limiting middleware
const rateLimit = (maxRequests: number, windowMs:number) => t.middleware(async ({ctx, next}) => {
    const key = `rate_limit:${ctx.ip}:${ctx.path}`;
    const current = await getRateLimitCount(key);

    if(current >= maxRequests) {
        throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests, please try again later',
        });
    }

    await incrementRateLimitCount(key,windowMs);

    return next();
});

const validateInput = (schema: any) => t.middleware(async({input,next}) => {
    try{
        const validatedInput = schema.parse(input);
        return next({
            ctx: {
                input: validatedInput
            }
        });
    } catch(error) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid input data",
            cause: error
        })
    }
});

// Logging middleware
const logRequest = t.middleware(async ({ctx,next}) => {
    const startTime = Date.now();

    try {
        const result = await next();
        const duration = Date.now() - startTime;

        // Log successful request
        logger.info(`[${new Date().toISOString()}] ${ctx.path} - ${duration}ms - ${ctx.ip}`);

        return result;
    } catch(error){
        const duration = Date.now() - startTime;

        logger.error(`[${new Date().toISOString()}] ${ctx.path} - ${duration}ms - ${ctx.ip} - ERROR: ${error}`)

        throw error;
    }
});

// Error handling middleware
const errorHandler = t.middleware(async({next}) => {
    try {
    return await next();
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    
    // Log unexpected errors
    logger.error('Unexpected error:', error);
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    });
  }
});

export const baseProcedure = t.procedure.use(logRequest).use(errorHandler).use(rateLimit(100,60_000)); // 100 requests per minute

export const publicProcedure = baseProcedure;

// Protected procedures
export const protectedProcedure = baseProcedure.use(isAuthenticated);

export const adminProcedure = baseProcedure.use(hasRole("ADMIN"));

export const superAdminProcedure = baseProcedure.use(hasRole('SUPER_ADMIN'));

export const dataSourceProcedure = baseProcedure.use(
  hasResourceAccess('dataSource', 'read')
);

export const dashboardProcedure = baseProcedure.use(
  hasResourceAccess('dashboard', 'read')
);

export const validatedProcedure = <T extends z.ZodType>(schema: T) => baseProcedure.use(validateInput(schema));

export const appRouter = router({
    register: t.procedure
        .input(z.object({
            email: z.string().email(),
            password: z.string().min(8),
            firstName: z.string().min(1),
            lastName: z.string().min(1),
            phone: z.string().optional()
        }))
        .mutation(async ({input,ctx}) => {
            console.log("Registered")
        }),
    health: publicProcedure.query(() => ({
        status: 'ok',
        timestamp: new Date().toISOString(),
    }))
});

export type AppRouter = typeof appRouter;

async function checkResourceAccess(
    userId: string,
    resourceType: string,
    action: string
): Promise<boolean> {
    return true;
}