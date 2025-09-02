// OAuth Authentication Service for Chrome Extension
class AuthService {
    constructor() {
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
    }

    // Initialize authentication state
    async init() {
        try {
            // Check if user is already authenticated
            const token = await this.getStoredToken();
            if (token) {
                this.token = token;
                // Try to validate the token by getting user info
                try {
                    await this.getUserInfo();
                    this.isAuthenticated = true;
                } catch (tokenError) {
                    console.log("Stored token is invalid, clearing it");
                    // Token is invalid, clear it
                    this.token = null;
                    this.isAuthenticated = false;
                    await this.removeToken();
                    // Re-throw the error so the calling code knows to show login
                    throw tokenError;
                }
            }
        } catch (error) {
            console.error("Auth initialization error:", error);
            // Clear any invalid state
            this.token = null;
            this.isAuthenticated = false;
            await this.removeToken();
            // Re-throw the error so the calling code knows to show login
            throw error;
        }
    }

    // Get stored token from Chrome storage
    async getStoredToken() {
        return new Promise((resolve) => {
            chrome.storage.local.get(["authToken"], (result) => {
                resolve(result.authToken || null);
            });
        });
    }

    // Store token in Chrome storage
    async storeToken(token) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ authToken: token }, () => {
                resolve();
            });
        });
    }

    // Remove token from Chrome storage
    async removeToken() {
        return new Promise((resolve) => {
            chrome.storage.local.remove(["authToken"], () => {
                resolve();
            });
        });
    }

    // Authenticate user with Google OAuth
    async authenticate() {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken(
                { interactive: true },
                async (token) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                        return;
                    }

                    if (token) {
                        this.token = token;
                        this.isAuthenticated = true;
                        await this.storeToken(token);
                        await this.getUserInfo();
                        resolve(this.user);
                    } else {
                        reject(new Error("Failed to get auth token"));
                    }
                }
            );
        });
    }

    // Get user information from Google
    async getUserInfo() {
        if (!this.token) {
            throw new Error("No token available");
        }

        try {
            const response = await fetch(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    // Token is unauthorized, try to refresh
                    console.log("Token unauthorized, attempting refresh");
                    try {
                        await this.refreshToken();
                        // Retry with new token
                        const retryResponse = await fetch(
                            "https://www.googleapis.com/oauth2/v2/userinfo",
                            {
                                headers: {
                                    Authorization: `Bearer ${this.token}`,
                                },
                            }
                        );
                        if (!retryResponse.ok) {
                            throw new Error(
                                "Failed to fetch user info after token refresh"
                            );
                        }
                        this.user = await retryResponse.json();
                        return this.user;
                    } catch (refreshError) {
                        console.log(
                            "Token refresh failed, clearing invalid token"
                        );
                        // Clear invalid token and throw error to trigger re-auth
                        this.token = null;
                        this.isAuthenticated = false;
                        await this.removeToken();
                        throw new Error(
                            "Token refresh failed, please sign in again"
                        );
                    }
                }
                throw new Error("Failed to fetch user info");
            }

            this.user = await response.json();
            return this.user;
        } catch (error) {
            console.error("Error fetching user info:", error);
            throw error;
        }
    }

    // Sign out user
    async signOut() {
        // Clear local state
        this.token = null;
        this.isAuthenticated = false;
        this.user = null;
        await this.removeToken();
    }

    // Check if user is authenticated
    getAuthStatus() {
        return {
            isAuthenticated: this.isAuthenticated,
            user: this.user,
        };
    }

    // Get current token
    getToken() {
        return this.token;
    }

    // Force clear authentication state
    async forceClearAuth() {
        console.log("Force clearing authentication state");
        this.token = null;
        this.isAuthenticated = false;
        this.user = null;
        await this.removeToken();
    }

    // Refresh the auth token
    async refreshToken() {
        try {
            // Get a fresh token from Chrome Identity API
            return new Promise((resolve, reject) => {
                chrome.identity.getAuthToken(
                    { interactive: false }, // Don't show UI, just refresh silently
                    async (token) => {
                        if (chrome.runtime.lastError) {
                            // Check if the error indicates user needs to re-authenticate
                            const error = chrome.runtime.lastError;
                            console.log("Token refresh error:", error);

                            if (
                                error.message.includes("OAuth2") ||
                                error.message.includes("invalid_grant") ||
                                error.message.includes("interaction_required")
                            ) {
                                reject(
                                    new Error("User needs to re-authenticate")
                                );
                            } else {
                                reject(new Error(error.message));
                            }
                            return;
                        }

                        if (token) {
                            this.token = token;
                            await this.storeToken(token);
                            resolve(token);
                        } else {
                            reject(new Error("Failed to refresh token"));
                        }
                    }
                );
            });
        } catch (error) {
            console.error("Error refreshing token:", error);
            throw error;
        }
    }

    // Validate and refresh token if needed
    async validateToken() {
        if (!this.token) {
            return false;
        }

        try {
            // Try to get user info with current token
            await this.getUserInfo();
            return true;
        } catch (error) {
            console.log("Token validation failed, attempting refresh");
            try {
                // Try to refresh the token
                await this.refreshToken();
                // Try to get user info again
                await this.getUserInfo();
                return true;
            } catch (refreshError) {
                console.log(
                    "Token refresh failed, user needs to re-authenticate"
                );
                // Clear invalid state
                this.token = null;
                this.isAuthenticated = false;
                await this.removeToken();
                return false;
            }
        }
    }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
