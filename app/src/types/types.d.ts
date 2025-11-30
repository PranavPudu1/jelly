declare interface User {
    id: string;
    phone?: string;
    name?: string;
    email?: string;
    deviceId?: string;
    dateAdded?: string;
    dateUpdated?: string;
    isConfirmed?: boolean;
}

declare interface Session {
    id: string;
    userId: string;
    started: string;
    ended?: string | null;
}
