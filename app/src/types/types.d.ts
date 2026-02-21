declare interface User {
    id: string;
    name: string;
    email?: string;
    preferences?: Record<string, number>; // User's preference weights
    mealContext?: string; // Free-text context for current discovery session
}
declare interface Session {
    token: string;
    expiresAt: number;
}
