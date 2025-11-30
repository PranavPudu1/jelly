declare interface User {
    id: string;
    name: string;
    email?: string;
    preferences?: Record<string, number>; // User's preference weights
}
declare interface Session {
    token: string;
    expiresAt: number;
}
