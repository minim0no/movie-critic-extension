// Authentication Debug Utility
// This file helps debug OAuth authentication issues

export const debugAuth = {
    // Log current authentication state
    logAuthState: () => {
        chrome.storage.local.get(["authToken"], (result) => {
            console.log("🔐 Current Auth State:");
            console.log("Token exists:", !!result.authToken);
            if (result.authToken) {
                console.log("Token length:", result.authToken.length);
                console.log(
                    "Token preview:",
                    result.authToken.substring(0, 20) + "..."
                );
            }
        });
    },

    // Test token validity
    testToken: async (token) => {
        try {
            const response = await fetch(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("🔍 Token Test Results:");
            console.log("Status:", response.status);
            console.log("OK:", response.ok);

            if (response.ok) {
                const userInfo = await response.json();
                console.log("User Info:", userInfo);
                return true;
            } else {
                const errorText = await response.text();
                console.log("Error Response:", errorText);
                return false;
            }
        } catch (error) {
            console.error("❌ Token test failed:", error);
            return false;
        }
    },

    // Clear all auth data
    clearAuth: () => {
        chrome.storage.local.remove(["authToken"], () => {
            console.log("🧹 Auth data cleared");
        });
    },

    // Check Chrome Identity API
    checkIdentityAPI: () => {
        console.log("🔍 Chrome Identity API Check:");
        console.log("chrome.identity available:", !!chrome.identity);
        if (chrome.identity) {
            console.log(
                "getAuthToken available:",
                !!chrome.identity.getAuthToken
            );
            console.log(
                "removeCachedAuthToken available:",
                !!chrome.identity.removeCachedAuthToken
            );
        }
    },

    // Test OAuth flow
    testOAuthFlow: () => {
        console.log("🔄 Testing OAuth Flow...");
        chrome.identity.getAuthToken({ interactive: false }, (token) => {
            if (chrome.runtime.lastError) {
                console.error("❌ OAuth Error:", chrome.runtime.lastError);
            } else if (token) {
                console.log(
                    "✅ OAuth Token received:",
                    token.substring(0, 20) + "..."
                );
                debugAuth.testToken(token);
            } else {
                console.log("⚠️ No token received");
            }
        });
    },

    // Test interactive OAuth flow
    testInteractiveOAuth: () => {
        console.log("🔄 Testing Interactive OAuth Flow...");
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                console.error(
                    "❌ Interactive OAuth Error:",
                    chrome.runtime.lastError
                );
            } else if (token) {
                console.log(
                    "✅ Interactive OAuth Token received:",
                    token.substring(0, 20) + "..."
                );
                debugAuth.testToken(token);
            } else {
                console.log("⚠️ No interactive token received");
            }
        });
    },

    // Check OAuth configuration
    checkOAuthConfig: () => {
        console.log("🔍 OAuth Configuration Check:");
        console.log(
            "Manifest OAuth2 config:",
            chrome.runtime.getManifest().oauth2
        );
        console.log(
            "Identity permission:",
            chrome.runtime.getManifest().permissions
        );

        // Check if we can access the identity API
        try {
            chrome.identity.getRedirectURL();
            console.log("✅ Identity API accessible");
        } catch (error) {
            console.error("❌ Identity API not accessible:", error);
        }
    },
};

// Add to window for console access
if (typeof window !== "undefined") {
    window.debugAuth = debugAuth;
}
