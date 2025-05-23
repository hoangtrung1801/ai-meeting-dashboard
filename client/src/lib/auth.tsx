import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "./queryClient";

interface User {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
    fullName: string;
    avatarUrl?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for token in localStorage on mount
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
            fetchUser(storedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchUser = async (authToken: string) => {
        try {
            const response = await fetch("/api/me", {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch user");
            const userData = await response.json();
            setUser(userData);
        } catch (error) {
            console.error("Error fetching user:", error);
            // If token is invalid, clear everything
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await apiRequest("POST", "/api/login", {
                email,
                password,
            });
            const data = await response.json();
            const { token: newToken, user: userData } = data;

            localStorage.setItem("token", newToken);
            setToken(newToken);
            setUser(userData);
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await apiRequest("POST", "/api/register", data);
            const responseData = await response.json();
            const { token: newToken, user: userData } = responseData;

            localStorage.setItem("token", newToken);
            setToken(newToken);
            setUser(userData);
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, token, isLoading, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
