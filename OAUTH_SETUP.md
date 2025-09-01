# OAuth Authentication Setup for CineMate Extension

## Overview

This Chrome extension now includes OAuth 2.0 authentication using Google's Identity API. Users must sign in to access the My List and Recommended features, and to add movies to their watchlist.

## Features Implemented

### 1. Authentication Flow

-   **Google OAuth 2.0**: Uses Chrome's Identity API for secure authentication
-   **Persistent Login**: Tokens are stored in Chrome's local storage
-   **Automatic Token Refresh**: Handled by Chrome's Identity API

### 2. Protected Features

-   **My List**: Requires authentication to view and manage watchlist
-   **Recommended**: Requires authentication to view personalized recommendations
-   **Add to Watchlist**: Redirects to login if user is not authenticated

### 3. User Experience

-   **Login Component**: Clean, modern login interface
-   **User Profile**: Shows user's name in the header when authenticated
-   **Sign Out**: Easy logout functionality
-   **Redirect Flow**: Seamless redirection from Netflix popup to extension

## Technical Implementation

### Files Added/Modified

#### New Files:

-   `src/services/auth.js` - OAuth authentication service
-   `src/contexts/AuthContext.jsx` - React context for auth state management
-   `src/components/Login.jsx` - Login component UI

#### Modified Files:

-   `src/App.jsx` - Added authentication wrapper and conditional rendering
-   `public/scripts/outroPopup.js` - Added authentication check before adding movies
-   `public/scripts/background.js` - Added popup opening message handling

### Authentication Service (`src/services/auth.js`)

```javascript
// Key methods:
- authenticate() - Initiates OAuth flow
- getUserInfo() - Fetches user profile from Google
- signOut() - Revokes token and clears local state
- getAuthStatus() - Returns current authentication state
```

### Context Provider (`src/contexts/AuthContext.jsx`)

```javascript
// Provides:
- isAuthenticated - Boolean auth state
- user - User profile object
- loading - Loading state
- signIn() - Sign in function
- signOut() - Sign out function
```

## OAuth Configuration

### Manifest.json

The extension is configured with:

```json
{
    "permissions": ["identity"],
    "oauth2": {
        "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
        "scopes": [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        ]
    }
}
```

### Google Cloud Console Setup

1. Create a new project in Google Cloud Console
2. Enable the Google+ API
3. Create OAuth 2.0 credentials
4. Set application type to "Chrome Extension"
5. Add your extension ID to the allowed origins

## User Flow

### 1. First Time User

1. User clicks "My List" or "Recommended"
2. Login component is displayed
3. User clicks "Sign in with Google"
4. Chrome opens OAuth consent screen
5. User grants permissions
6. User is redirected back to the requested page

### 2. Adding Movies from Search

1. User clicks "Add" on a movie card
2. If not authenticated, redirects to My List page
3. Login component is shown
4. After authentication, user can add movies

### 3. Adding Movies from Netflix

1. User clicks "Add to my CineMate List" in Netflix popup
2. If not authenticated, extension popup opens to My List page
3. User can then authenticate and add the movie

## Security Features

-   **Token Storage**: Tokens stored securely in Chrome's local storage
-   **Token Revocation**: Proper token revocation on sign out
-   **Error Handling**: Graceful error handling for auth failures
-   **Privacy**: Only requests necessary scopes (email and profile)

## Testing

### Development Testing

1. Load extension in Chrome
2. Navigate to My List or Recommended
3. Verify login flow works
4. Test adding movies from search
5. Test Netflix popup integration

### Production Testing

1. Publish extension to Chrome Web Store
2. Test with real users
3. Monitor authentication success rates
4. Verify token refresh works correctly

## Troubleshooting

### Common Issues

1. **"Invalid client" error**: Check client ID in manifest
2. **"Redirect URI mismatch"**: Verify extension ID is correct
3. **Token not persisting**: Check Chrome storage permissions
4. **Popup not opening**: Verify background script message handling

### Debug Steps

1. Check Chrome DevTools console for errors
2. Verify OAuth client configuration
3. Test authentication flow in isolation
4. Check network requests for API calls

## Future Enhancements

-   **Social Login**: Add support for other providers
-   **Profile Management**: Allow users to edit profile
-   **Data Sync**: Sync watchlist across devices
-   **Analytics**: Track authentication metrics
