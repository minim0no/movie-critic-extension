import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/auth";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize authentication state
    useEffect(() => {
        const initAuth = async () => {
            try {
                await authService.init();
                // If we get here, the token is valid
                const { isAuthenticated, user } = authService.getAuthStatus();
                setIsAuthenticated(isAuthenticated);
                setUser(user);
            } catch (error) {
                console.error("Auth initialization error:", error);
                // Any error during init means we need to show login
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // Sign in function
    const signIn = async () => {
        try {
            setLoading(true);
            const user = await authService.authenticate();
            setIsAuthenticated(true);
            setUser(user);
            return user;
        } catch (error) {
            console.error("Sign in error:", error);
            // Clear any invalid state
            setIsAuthenticated(false);
            setUser(null);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Sign out function
    const signOut = async () => {
        try {
            setLoading(true);
            await authService.signOut();
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error("Sign out error:", error);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        signIn,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
