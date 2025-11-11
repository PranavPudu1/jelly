import { createContext, PropsWithChildren, useState } from 'react';

export const UserContext = createContext<{
    user: User | null;
    session: Session | null;
    setUser: (_u: User | null) => void;
    setSession: (_s: Session | null) => void;
}>({
    user: null,
    session: null,
    setUser: () => {},
    setSession: () => {},
});

export default function UserContextWrapper({ children }: PropsWithChildren) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);

    return (
        <UserContext.Provider value={{ user, session, setUser, setSession }}>
            {children}
        </UserContext.Provider>
    );
}
