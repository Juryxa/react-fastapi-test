import {createContext, useContext, useState} from "react";
import type {ReactNode} from "react";

interface AuthContextValue {
    isAdmin: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [isAdmin, setIsAdmin] = useState(false);

    const login = () => setIsAdmin(true);
    const logout = () => setIsAdmin(false);

    return (
        <AuthContext.Provider value={{isAdmin, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return ctx;
};
