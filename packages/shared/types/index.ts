export interface User {
  id: string;
  email: string;
  emailVerified?: Date;
  phone?: string;
  phoneVerified?: Date;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  failedLoginCount: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}