
export class AppError extends Error {
    public readonly isOperational?: boolean;
    public readonly details?: any;
    public readonly statusCode: number;

    public constructor(message: string,statusCode: number,isOperational = true, details?:any) {
        super(message);
        this.details = details;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this);
    }
}

export class NotFoundError extends AppError {
    constructor(message="Resources not found") {
        super(message,404);
    }
}

export class ValidationError extends AppError {
    constructor(message="Invalid request data", details?:any){
        super(message,400,true,details);
    }
}

export class AuthenticationError extends AppError {
    constructor(message="Unauthorized") {
        super(message,401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message="Forbidden access") {
        super(message,403);
    }
}

export class DatabaseError extends AppError {
    constructor(message="Database error",details?:any) {
        super(message,500,true,details);
    }
}

export class RateLimitError extends AppError {
    constructor(message="Too many requests, please try again later") {
        super(message,429);
    }
}