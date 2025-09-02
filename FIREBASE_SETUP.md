# Firebase Setup for Movie Critic Extension

## Overview

The extension has been updated to use Firebase Functions instead of making direct API calls from the background script. This provides better security and centralized API management.

**IMPORTANT SECURITY NOTE**: No API keys or Firebase configuration are stored in the extension code. All sensitive configuration is handled server-side through Firebase Functions.

## Changes Made

### 1. Background Script (`public/scripts/background.js`)

-   Removed direct OMDB API calls
-   Now sends messages to popup to call Firebase functions
-   **Implements smart caching**: checks cache before making Firebase API calls
-   Maintains the same caching and storage functionality

### 2. Firebase Functions (`functions/index.js`)

-   Added `getMovieData` function that handles OMDB API calls
-   Uses environment variables for API keys
-   Includes proper error handling and logging
-   **Optimized for caching**: returns cache metadata for better performance

### 3. Popup Script (`public/scripts/popup.js`)

-   Added message listener for Firebase function calls
-   Sends requests to background script for secure handling
-   No Firebase SDK imports or configuration in the extension code

## Setup Instructions

### 1. Firebase Project Setup ✅ COMPLETED

1. ✅ Firebase project: `movie-chrome-extension-a68f2`
2. ✅ Cloud Functions enabled
3. ✅ Billing configured
4. ✅ Functions deployed successfully

### 2. Environment Variables ✅ CONFIGURED

Your OMDB API key is already configured in Firebase:

```bash
# Current configuration:
firebase functions:config:get
# Returns: {"omdb": {"api_key": "d7786aee"}}
```

### 3. Firebase Configuration

**No Firebase configuration needs to be added to the extension code.** The extension communicates with Firebase Functions through a secure backend approach that keeps all configuration server-side.

The Firebase project configuration is only needed on the server side when deploying functions.

### 4. Deploy Functions ✅ COMPLETED

Functions have been successfully deployed to:
`https://us-central1-movie-chrome-extension-a68f2.cloudfunctions.net/getMovieData`

### 5. Build Extension ✅ COMPLETED

Extension has been built successfully and is ready to use!

## Security Benefits

-   API keys are no longer exposed in the extension code
-   Centralized API management through Firebase
-   Better rate limiting and monitoring capabilities
-   Easier to update API logic without redeploying the extension

## Troubleshooting

-   Ensure Firebase project has billing enabled
-   Check that environment variables are set correctly
-   Verify Firebase Functions are deployed successfully
-   Check browser console for any import errors

## Dependencies Added

-   `axios` (functions only)
-   Firebase Admin SDK (functions only)

**Note**: No Firebase dependencies are added to the main extension code, keeping it secure and lightweight.
