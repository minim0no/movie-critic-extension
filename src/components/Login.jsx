import React, { useState } from "react";
import { LogIn, User, Shield, Bug } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { debugAuth } from "../utils/authDebug";

function Login({ onLoginSuccess }) {
    const { signIn, loading } = useAuth();
    const [error, setError] = useState("");

    const handleSignIn = async () => {
        try {
            setError("");
            await signIn();
            if (onLoginSuccess) {
                onLoginSuccess();
            }
        } catch (error) {
            console.error("Login failed:", error);
            setError(error.message || "Failed to sign in. Please try again.");
        }
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="flex flex-col items-center justify-center p-6 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Shield className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                        Sign in to CineMate
                    </h2>
                    <p className="text-sm text-gray-600 max-w-xs">
                        Connect your Google account to save your movie
                        preferences and access personalized recommendations
                    </p>
                </div>

                {/* Benefits */}
                <div className="w-full space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-medium text-sm text-gray-800">
                                Personalized Experience
                            </h4>
                            <p className="text-xs text-gray-600">
                                Get recommendations based on your taste
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Shield className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <h4 className="font-medium text-sm text-gray-800">
                                Secure & Private
                            </h4>
                            <p className="text-xs text-gray-600">
                                Your data is protected and never shared
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-600 text-center">
                            {error}
                        </p>
                    </div>
                )}

                {/* Sign In Button */}
                <button
                    onClick={handleSignIn}
                    disabled={loading}
                    className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <LogIn className="w-4 h-4" />
                    )}
                    {loading ? "Signing in..." : "Sign in with Google"}
                </button>

                {/* Privacy Notice */}
                <p className="text-xs text-gray-500 text-center max-w-xs">
                    By signing in, you agree to our privacy policy and terms of
                    service
                </p>

                {/* Debug Section */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                    <button
                        onClick={() => debugAuth.logAuthState()}
                        className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto"
                        title="Debug authentication state"
                    >
                        <Bug className="w-3 h-3" />
                        Debug Auth
                    </button>
                    <button
                        onClick={() => debugAuth.clearAuth()}
                        className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto"
                        title="Clear authentication data"
                    >
                        <Bug className="w-3 h-3" />
                        Clear Auth Data
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;
