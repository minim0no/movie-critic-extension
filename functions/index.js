/* eslint-env node */

const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");
const axios = require("axios");
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

setGlobalOptions({ maxInstances: 100 });

exports.getMovieData = onRequest(
    {
        maxInstances: 50,
        timeoutSeconds: 30,
        memory: "256MiB",
    },
    async (req, res) => {
        return cors(req, res, async () => {
            try {
                console.log("=== getMovieData function called ===", {
                    timestamp: new Date().toISOString(),
                    method: req.method,
                    query: req.query,
                    headers: req.headers,
                    userAgent: req.headers["user-agent"] || "unknown",
                });

                if (req.method !== "GET") {
                    console.log("Invalid HTTP method for getMovieData", {
                        method: req.method,
                    });
                    return res
                        .status(405)
                        .json({ error: "Use GET method only." });
                }

                const { movieName, movieYear } = req.query;
                console.log("Received movie request", {
                    movieName: movieName,
                    movieYear: movieYear,
                    movieNameType: typeof movieName,
                    movieYearType: typeof movieYear,
                });

                if (!movieName) {
                    console.log("Movie name is missing from request");
                    return res
                        .status(400)
                        .json({ error: "Movie name is required." });
                }

                // Try multiple ways to get the API key
                let API_KEY = process.env.OMDB_API_KEY;

                if (!API_KEY) {
                    // Fallback to Firebase config
                    try {
                        API_KEY = functions.config().omdb.api_key;
                    } catch (configError) {
                        console.warn(
                            "Failed to get Firebase config:",
                            configError.message
                        );
                    }
                }

                if (!API_KEY) {
                    return res.status(500).json({
                        error: "OMDB API key not configured in .env or Firebase config.",
                    });
                }

                const url = `https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(
                    movieName
                )}&plot=full&y=${movieYear || ""}`;

                console.log("Calling OMDB API", {
                    originalMovieName: movieName,
                    encodedMovieName: encodeURIComponent(movieName),
                    fullUrl: url.replace(API_KEY, "API_KEY_HIDDEN"),
                    hasYear: !!movieYear,
                });

                const { data } = await axios.get(url);

                console.log("OMDB API response received", {
                    responseStatus: data.Response,
                    hasTitle: !!data.Title,
                    title: data.Title,
                    hasError: !!data.Error,
                    error: data.Error,
                    hasImdbRating: !!data.imdbRating,
                    imdbRating: data.imdbRating,
                });

                res.json({
                    success: true,
                    data,
                });
            } catch (err) {
                console.log("Error in getMovieData function", {
                    error: err.message,
                    stack: err.stack,
                    movieName: req.query.movieName,
                    movieYear: req.query.movieYear,
                    timestamp: new Date().toISOString(),
                });
                res.status(500).json({ success: false, error: err.message });
            }
        });
    }
);

// Get trending movies from TMDb
exports.getTrendingMovies = onRequest(
    {
        maxInstances: 20,
        timeoutSeconds: 60,
        memory: "512MiB",
    },
    async (req, res) => {
        return cors(req, res, async () => {
            try {
                logger.info("=== getTrendingMovies function called ===", {
                    timestamp: new Date().toISOString(),
                    method: req.method,
                    headers: req.headers,
                    userAgent: req.headers["user-agent"] || "unknown",
                });

                if (req.method !== "GET") {
                    logger.warn("Invalid HTTP method for trending movies", {
                        method: req.method,
                    });
                    return res
                        .status(405)
                        .json({ error: "Use GET method only." });
                }

                logger.info("Checking TMDb API key configuration");
                const TMDB_API_KEY = process.env.TMDB_API_KEY;

                logger.info("TMDb API key check", {
                    hasKey: !!TMDB_API_KEY,
                    keyLength: TMDB_API_KEY ? TMDB_API_KEY.length : 0,
                    keyStart: TMDB_API_KEY
                        ? TMDB_API_KEY.substring(0, 20) + "..."
                        : "none",
                    envVars: Object.keys(process.env).filter((key) =>
                        key.includes("TMDB")
                    ),
                    allEnvKeys: Object.keys(process.env),
                });

                if (!TMDB_API_KEY) {
                    logger.error("TMDb API key not configured", {
                        envVars: Object.keys(process.env).filter((key) =>
                            key.includes("TMDB")
                        ),
                        allEnvKeys: Object.keys(process.env),
                    });
                    return res.status(500).json({
                        error: "TMDb API key not configured in .env.",
                    });
                }

                const url =
                    "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1";
                logger.info("Making TMDb API request", {
                    url: url,
                    headers: {
                        Authorization: `Bearer ${TMDB_API_KEY.substring(
                            0,
                            20
                        )}...`,
                        accept: "application/json",
                    },
                });

                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${TMDB_API_KEY}`,
                        accept: "application/json",
                    },
                });

                logger.info("TMDb API response received", {
                    status: response.status,
                    statusText: response.statusText,
                    dataKeys: Object.keys(response.data || {}),
                    resultsCount: response.data?.results?.length || 0,
                    firstMovie: response.data?.results?.[0]
                        ? {
                              title: response.data.results[0].title,
                              id: response.data.results[0].id,
                              poster_path: response.data.results[0].poster_path,
                          }
                        : "none",
                });

                res.json({
                    success: true,
                    data: response.data.results,
                });

                logger.info("Trending movies response sent successfully");
            } catch (err) {
                logger.error("Error in getTrendingMovies function", {
                    error: err.message,
                    stack: err.stack,
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    responseData: err.response?.data,
                    requestHeaders: err.config?.headers,
                    requestUrl: err.config?.url,
                    fullError: err,
                });
                res.status(500).json({ success: false, error: err.message });
            }
        });
    }
);

// Get top-rated movies from TMDb
exports.getTopRatedMovies = onRequest(
    {
        maxInstances: 20,
        timeoutSeconds: 60,
        memory: "512MiB",
    },
    async (req, res) => {
        return cors(req, res, async () => {
            try {
                logger.info("=== getTopRatedMovies function called ===", {
                    timestamp: new Date().toISOString(),
                    method: req.method,
                    headers: req.headers,
                    userAgent: req.headers["user-agent"] || "unknown",
                });

                if (req.method !== "GET") {
                    logger.warn("Invalid HTTP method for top-rated movies", {
                        method: req.method,
                    });
                    return res
                        .status(405)
                        .json({ error: "Use GET method only." });
                }

                logger.info(
                    "Checking TMDb API key configuration for top-rated"
                );
                const TMDB_API_KEY = process.env.TMDB_API_KEY;

                logger.info("TMDb API key check for top-rated", {
                    hasKey: !!TMDB_API_KEY,
                    keyLength: TMDB_API_KEY ? TMDB_API_KEY.length : 0,
                    keyStart: TMDB_API_KEY
                        ? TMDB_API_KEY.substring(0, 20) + "..."
                        : "none",
                });

                if (!TMDB_API_KEY) {
                    logger.error("TMDb API key not configured for top-rated");
                    return res.status(500).json({
                        error: "TMDb API key not configured in .env.",
                    });
                }

                const url =
                    "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1";
                logger.info("Making TMDb top-rated API request", {
                    url: url,
                    headers: {
                        Authorization: `Bearer ${TMDB_API_KEY.substring(
                            0,
                            20
                        )}...`,
                        accept: "application/json",
                    },
                });

                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${TMDB_API_KEY}`,
                        accept: "application/json",
                    },
                });

                logger.info("TMDb top-rated API response received", {
                    status: response.status,
                    statusText: response.statusText,
                    dataKeys: Object.keys(response.data || {}),
                    resultsCount: response.data?.results?.length || 0,
                    firstMovie: response.data?.results?.[0]
                        ? {
                              title: response.data.results[0].title,
                              id: response.data.results[0].id,
                              poster_path: response.data.results[0].poster_path,
                          }
                        : "none",
                });

                res.json({
                    success: true,
                    data: response.data.results,
                });

                logger.info("Top-rated movies response sent successfully");
            } catch (err) {
                logger.error("Error in getTopRatedMovies function", {
                    error: err.message,
                    stack: err.stack,
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    responseData: err.response?.data,
                    requestHeaders: err.config?.headers,
                    requestUrl: err.config?.url,
                    fullError: err,
                });
                res.status(500).json({ success: false, error: err.message });
            }
        });
    }
);

// Get AI critique for a movie using OpenAI
exports.getAICritique = onRequest(
    {
        maxInstances: 30,
        timeoutSeconds: 120,
        memory: "512MiB",
    },
    async (req, res) => {
        return cors(req, res, async () => {
            try {
                logger.info("=== getAICritique function called ===", {
                    timestamp: new Date().toISOString(),
                    method: req.method,
                    headers: req.headers,
                    userAgent: req.headers["user-agent"] || "unknown",
                });

                if (req.method !== "POST") {
                    logger.warn("Invalid HTTP method for AI critique", {
                        method: req.method,
                    });
                    return res
                        .status(405)
                        .json({ error: "Use POST method only." });
                }

                const { movieData } = req.body;

                if (!movieData) {
                    logger.warn("Movie data missing from AI critique request");
                    return res.status(400).json({
                        error: "Movie data is required for AI critique.",
                    });
                }

                logger.info("Processing AI critique request", {
                    movieTitle: movieData.Title,
                    movieYear: movieData.Year,
                    hasActors: !!movieData.Actors,
                    usingMinimalData: true,
                });

                // Get OpenAI API key
                const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

                if (!OPENAI_API_KEY) {
                    logger.error("OpenAI API key not configured");
                    return res.status(500).json({
                        error: "OpenAI API key not configured in .env.",
                    });
                }

                // Prepare essential movie information for AI (focus on plot/story identification)
                const movieInfo = `
Title: ${movieData.Title || "Unknown"}
Year: ${movieData.Year || "Unknown"}
Genre: ${movieData.Genre || "Unknown"}
Plot: ${movieData.Plot || "Unknown"}
            `.trim();

                // Create the prompt for OpenAI
                const prompt = `You are a professional movie critic. Analyze the movie below and provide a balanced review that highlights both strengths and areas for improvement. Be honest about flaws but don't be overly harsh. Never put movie titles in quotation marks - just use the title directly. Write exactly 50 words in a single paragraph.

Movie Information:
${movieInfo}

Your balanced critique:`;

                logger.info("Sending request to OpenAI", {
                    movieTitle: movieData.Title,
                    promptLength: prompt.length,
                });

                // Call OpenAI API
                const openaiResponse = await axios.post(
                    "https://api.openai.com/v1/chat/completions",
                    {
                        model: "gpt-4o-mini", // Best model for movie critique - good balance of quality and cost
                        messages: [
                            {
                                role: "system",
                                content:
                                    "You are a professional movie critic who writes balanced, honest reviews. Highlight both what works and what doesn't, but avoid being overly negative. Never use quotation marks around movie titles. Write exactly 50 words. Be constructive in your criticism and fair in your assessment.",
                            },
                            {
                                role: "user",
                                content: prompt,
                            },
                        ],
                        max_tokens: 200,
                        temperature: 0.8,
                        top_p: 0.9,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${OPENAI_API_KEY}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                logger.info("OpenAI API response received", {
                    status: openaiResponse.status,
                    statusText: openaiResponse.statusText,
                    hasChoices: !!openaiResponse.data?.choices,
                    choicesCount: openaiResponse.data?.choices?.length || 0,
                    usage: openaiResponse.data?.usage,
                });

                if (openaiResponse.data?.choices?.[0]?.message?.content) {
                    const critique =
                        openaiResponse.data.choices[0].message.content.trim();

                    logger.info("AI critique generated successfully", {
                        movieTitle: movieData.Title,
                        critiqueLength: critique.length,
                    });

                    res.json({
                        success: true,
                        critique: critique,
                        usage: openaiResponse.data.usage,
                    });
                } else {
                    logger.error("No critique content in OpenAI response", {
                        response: openaiResponse.data,
                    });
                    res.status(500).json({
                        success: false,
                        error: "No critique generated by AI",
                    });
                }
            } catch (err) {
                logger.error("Error in getAICritique function", {
                    error: err.message,
                    stack: err.stack,
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    responseData: err.response?.data,
                    movieTitle: req.body?.movieData?.Title,
                    timestamp: new Date().toISOString(),
                });

                res.status(500).json({
                    success: false,
                    error: err.response?.data?.error?.message || err.message,
                });
            }
        });
    }
);

// Get user lists
exports.getUserLists = onRequest(
    {
        maxInstances: 20,
        timeoutSeconds: 30,
        memory: "256MiB",
    },
    async (req, res) => {
        return cors(req, res, async () => {
            try {
                logger.info("=== getUserLists function called ===", {
                    timestamp: new Date().toISOString(),
                    method: req.method,
                });

                if (req.method !== "POST") {
                    return res
                        .status(405)
                        .json({ error: "Use POST method only." });
                }

                const { userEmail } = req.body;
                if (!userEmail) {
                    return res
                        .status(400)
                        .json({ error: "User email is required." });
                }

                // Get user lists from Firestore
                const listsRef = db
                    .collection("users")
                    .doc(userEmail)
                    .collection("lists");
                const listsSnapshot = await listsRef
                    .orderBy("createdAt", "desc")
                    .get();

                const lists = [];
                for (const listDoc of listsSnapshot.docs) {
                    const listData = { id: listDoc.id, ...listDoc.data() };

                    // Get movies in this list
                    const moviesRef = listDoc.ref.collection("movies");
                    const moviesSnapshot = await moviesRef
                        .orderBy("addedAt", "desc")
                        .get();

                    listData.movies = moviesSnapshot.docs.map((movieDoc) => ({
                        id: movieDoc.id,
                        ...movieDoc.data(),
                    }));

                    lists.push(listData);
                }

                // If no lists exist, create default lists
                if (lists.length === 0) {
                    const defaultLists = [
                        { id: "watchlist", name: "My Watchlist" },
                        { id: "favorites", name: "Favorites" },
                        { id: "to-watch", name: "To Watch Later" },
                    ];

                    for (const listData of defaultLists) {
                        await listsRef.doc(listData.id).set({
                            name: listData.name,
                            createdAt:
                                admin.firestore.FieldValue.serverTimestamp(),
                            isDefault: true,
                        });
                        lists.push({
                            ...listData,
                            movies: [],
                            isDefault: true,
                        });
                    }
                }

                res.json({ success: true, lists });
            } catch (error) {
                logger.error("Error getting user lists:", error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }
);

// Add movie to list
exports.addMovieToList = onRequest(
    {
        maxInstances: 20,
        timeoutSeconds: 30,
        memory: "256MiB",
    },
    async (req, res) => {
        return cors(req, res, async () => {
            try {
                logger.info("=== addMovieToList function called ===", {
                    timestamp: new Date().toISOString(),
                    method: req.method,
                });

                if (req.method !== "POST") {
                    return res
                        .status(405)
                        .json({ error: "Use POST method only." });
                }

                const { userEmail, listId, movieData } = req.body;
                logger.info("addMovieToList params:", {
                    userEmail: userEmail,
                    userEmailType: typeof userEmail,
                    userEmailLength: userEmail?.length,
                    listId: listId,
                    movieData: movieData,
                });

                if (
                    !userEmail ||
                    typeof userEmail !== "string" ||
                    userEmail.trim().length === 0
                ) {
                    logger.error("Invalid userEmail:", {
                        userEmail,
                        type: typeof userEmail,
                    });
                    return res.status(400).json({
                        error: "Valid user email is required.",
                    });
                }

                if (
                    !listId ||
                    typeof listId !== "string" ||
                    listId.trim().length === 0
                ) {
                    return res.status(400).json({
                        error: "Valid list ID is required.",
                    });
                }

                if (!movieData) {
                    return res.status(400).json({
                        error: "Movie data is required.",
                    });
                }

                // Generate a valid document ID for the movie
                const movieDocId =
                    movieData.imdbId ||
                    movieData.imdbID ||
                    movieData.id ||
                    (movieData.title || movieData.Title
                        ? (movieData.title || movieData.Title)
                              .toLowerCase()
                              .replace(/[^a-z0-9]/g, "-")
                              .replace(/-+/g, "-")
                              .replace(/^-|-$/g, "")
                        : null);

                logger.info("Movie document ID generation:", {
                    imdbId: movieData.imdbId,
                    imdbID: movieData.imdbID,
                    id: movieData.id,
                    title: movieData.title,
                    Title: movieData.Title,
                    generatedDocId: movieDocId,
                });

                if (!movieDocId || movieDocId.trim().length === 0) {
                    logger.error("No valid movie ID found:", movieData);
                    return res.status(400).json({
                        error: "Movie must have a valid ID or title.",
                    });
                }

                // Add movie to Firestore list
                const movieRef = db
                    .collection("users")
                    .doc(userEmail)
                    .collection("lists")
                    .doc(listId)
                    .collection("movies")
                    .doc(movieDocId);

                await movieRef.set(
                    {
                        ...movieData,
                        addedAt: admin.firestore.FieldValue.serverTimestamp(),
                    },
                    { merge: true }
                );

                // Also add to watchHistory so the movie can be rated
                // (Only if it doesn't already exist in watchHistory)
                const historyRef = db
                    .collection("users")
                    .doc(userEmail)
                    .collection("watchHistory")
                    .doc(movieDocId);

                const historyDoc = await historyRef.get();
                let existingRating = null;

                if (historyDoc.exists) {
                    // Movie already exists in watch history, get existing rating
                    const historyData = historyDoc.data();
                    existingRating = historyData.userRating || null;
                    logger.info(
                        `Movie already in watchHistory with rating: ${existingRating}`
                    );
                } else {
                    // Create watchHistory entry for movies added to list (but not watched yet)
                    await historyRef.set({
                        ...movieData,
                        addedToListAt:
                            admin.firestore.FieldValue.serverTimestamp(),
                        watchedAt: null, // Not watched yet, just added to list
                        completedPercentage: 0,
                        userRating: null, // No rating yet
                        deviceType: "chrome-extension",
                    });
                }

                // No rating sync - ratings only stored in watchHistory

                res.json({ success: true });
            } catch (error) {
                logger.error("Error adding movie to list:", error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }
);

// Add to watch history
exports.addToWatchHistory = onRequest(
    {
        maxInstances: 20,
        timeoutSeconds: 30,
        memory: "256MiB",
    },
    async (req, res) => {
        return cors(req, res, async () => {
            try {
                logger.info("=== addToWatchHistory function called ===", {
                    timestamp: new Date().toISOString(),
                    method: req.method,
                });

                if (req.method !== "POST") {
                    return res
                        .status(405)
                        .json({ error: "Use POST method only." });
                }

                const { userEmail, movieData } = req.body;
                logger.info("addToWatchHistory params:", {
                    userEmail: userEmail,
                    userEmailType: typeof userEmail,
                    userEmailLength: userEmail?.length,
                    movieData: movieData,
                });

                if (
                    !userEmail ||
                    typeof userEmail !== "string" ||
                    userEmail.trim().length === 0
                ) {
                    logger.error("Invalid userEmail:", {
                        userEmail,
                        type: typeof userEmail,
                    });
                    return res.status(400).json({
                        error: "Valid user email is required.",
                    });
                }

                if (!movieData) {
                    return res.status(400).json({
                        error: "Movie data is required.",
                    });
                }

                // Generate a valid document ID for the movie
                const movieDocId =
                    movieData.imdbId ||
                    movieData.imdbID ||
                    movieData.id ||
                    (movieData.title || movieData.Title
                        ? (movieData.title || movieData.Title)
                              .toLowerCase()
                              .replace(/[^a-z0-9]/g, "-")
                              .replace(/-+/g, "-")
                              .replace(/^-|-$/g, "")
                        : null);

                logger.info("Movie document ID generation:", {
                    imdbId: movieData.imdbId,
                    imdbID: movieData.imdbID,
                    id: movieData.id,
                    title: movieData.title,
                    Title: movieData.Title,
                    generatedDocId: movieDocId,
                });

                if (!movieDocId || movieDocId.trim().length === 0) {
                    logger.error("No valid movie ID found:", movieData);
                    return res.status(400).json({
                        error: "Movie must have a valid ID or title.",
                    });
                }

                // Add to watch history in Firestore
                const historyRef = db
                    .collection("users")
                    .doc(userEmail)
                    .collection("watchHistory")
                    .doc(movieDocId);

                await historyRef.set(
                    {
                        ...movieData,
                        watchedAt: admin.firestore.FieldValue.serverTimestamp(),
                        completedPercentage: 100,
                        deviceType: "chrome-extension",
                    },
                    { merge: true }
                );

                res.json({ success: true });
            } catch (error) {
                logger.error("Error adding to watch history:", error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }
);

// DEPRECATED: Rate movie in list - Use rateMovie instead for unified rating
exports.rateMovieInList = onRequest(
    {
        maxInstances: 20,
        timeoutSeconds: 30,
        memory: "256MiB",
    },
    async (req, res) => {
        return cors(req, res, async () => {
            try {
                logger.info(
                    "=== DEPRECATED rateMovieInList - redirecting to unified rateMovie ===",
                    {
                        timestamp: new Date().toISOString(),
                        method: req.method,
                    }
                );

                if (req.method !== "POST") {
                    return res
                        .status(405)
                        .json({ error: "Use POST method only." });
                }

                const { userEmail, listId, movieId, rating } = req.body;
                if (!userEmail || !movieId || rating === undefined) {
                    return res.status(400).json({
                        error: "User email, movie ID, and rating are required.",
                    });
                }

                // Get movie data from the list to pass to unified system
                let movieData = {};
                if (listId) {
                    try {
                        const listMovieRef = db
                            .collection("users")
                            .doc(userEmail)
                            .collection("lists")
                            .doc(listId)
                            .collection("movies")
                            .doc(movieId);
                        const listMovieDoc = await listMovieRef.get();
                        if (listMovieDoc.exists) {
                            movieData = listMovieDoc.data();
                        }
                    } catch (error) {
                        logger.warn(
                            "Could not get movie data from list, using minimal data"
                        );
                    }
                }

                // Use the unified rating logic from rateMovie
                const historyRef = db
                    .collection("users")
                    .doc(userEmail)
                    .collection("watchHistory")
                    .doc(movieId);

                const historyDoc = await historyRef.get();

                if (historyDoc.exists) {
                    // Update existing watch history entry with rating
                    await historyRef.update({
                        userRating: rating,
                        ratedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                } else {
                    // Create new watch history entry with rating
                    await historyRef.set({
                        ...movieData,
                        userRating: rating,
                        ratedAt: admin.firestore.FieldValue.serverTimestamp(),
                        watchedAt: null, // Not watched yet, just rated
                        completedPercentage: 0,
                        deviceType: "chrome-extension",
                    });
                }

                // Sync rating to all lists where this movie exists (unified approach)
                logger.info("Starting bidirectional sync to lists...");
                try {
                    const listsRef = db
                        .collection("users")
                        .doc(userEmail)
                        .collection("lists");
                    const listsSnapshot = await listsRef.get();
                    logger.info(
                        `Found ${listsSnapshot.docs.length} lists to check`
                    );

                    for (const listDoc of listsSnapshot.docs) {
                        logger.info(`Checking list: ${listDoc.id}`);
                        const movieInListRef = listDoc.ref
                            .collection("movies")
                            .doc(movieId);
                        const movieInListDoc = await movieInListRef.get();

                        if (movieInListDoc.exists) {
                            logger.info(
                                `Movie found in list ${listDoc.id}, syncing rating...`
                            );
                            await movieInListRef.update({
                                userRating: rating,
                                ratedAt:
                                    admin.firestore.FieldValue.serverTimestamp(),
                            });
                            logger.info(
                                `✅ Synced rating to list: ${listDoc.id}`
                            );
                        }
                    }
                    logger.info("Bidirectional sync completed successfully");
                } catch (syncError) {
                    logger.error("Error in bidirectional sync:", syncError);
                }

                res.json({ success: true });
            } catch (error) {
                logger.error("Error in deprecated rateMovieInList:", error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }
);

// Get user watchlist
exports.getUserWatchlist = onRequest(
    {
        maxInstances: 20,
        timeoutSeconds: 30,
        memory: "256MiB",
    },
    async (req, res) => {
        return cors(req, res, async () => {
            try {
                logger.info("=== getUserWatchlist function called ===", {
                    timestamp: new Date().toISOString(),
                    method: req.method,
                });

                if (req.method !== "POST") {
                    return res
                        .status(405)
                        .json({ error: "Use POST method only." });
                }

                const { userEmail } = req.body;
                if (!userEmail) {
                    return res
                        .status(400)
                        .json({ error: "User email is required." });
                }

                // Get watchlist from Firestore
                const moviesRef = db
                    .collection("users")
                    .doc(userEmail)
                    .collection("lists")
                    .doc("watchlist")
                    .collection("movies");

                const moviesSnapshot = await moviesRef
                    .orderBy("addedAt", "desc")
                    .get();
                const watchlist = moviesSnapshot.docs.map((doc) => {
                    const data = doc.data();
                    // Normalize field names for consistency
                    return {
                        id: doc.id,
                        ...data,
                        // Ensure consistent field names (prioritize lowercase versions)
                        title: data.title || data.Title,
                        imdbId: data.imdbId || data.imdbID,
                        imdbRating: data.imdbRating || data.ImdbRating,
                        year: data.year || data.Year,
                        genre: data.genre || data.Genre,
                        director: data.director || data.Director,
                        actors: data.actors || data.Actors,
                        plot: data.plot || data.Plot,
                        poster: data.poster || data.Poster,
                        runtime: data.runtime || data.Runtime,
                        rated: data.rated || data.Rated,
                        writer: data.writer || data.Writer,
                        awards: data.awards || data.Awards,
                        metascore: data.metascore || data.Metascore,
                        type: data.type || data.Type,
                        dvd: data.dvd || data.DVD,
                        boxOffice: data.boxOffice || data.BoxOffice,
                        production: data.production || data.Production,
                        website: data.website || data.Website,
                        country: data.country || data.Country,
                        language: data.language || data.Language,
                        released: data.released || data.Released,
                        ratings: data.ratings || data.Ratings,
                        imdbVotes: data.imdbVotes || data.ImdbVotes,
                    };
                });

                res.json({ success: true, watchlist });
            } catch (error) {
                logger.error("Error getting user watchlist:", error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }
);

// Remove from watchlist
exports.removeFromWatchlist = onRequest(
    {
        maxInstances: 20,
        timeoutSeconds: 30,
        memory: "256MiB",
    },
    async (req, res) => {
        return cors(req, res, async () => {
            try {
                logger.info("=== removeFromWatchlist function called ===", {
                    timestamp: new Date().toISOString(),
                    method: req.method,
                });

                if (req.method !== "POST") {
                    return res
                        .status(405)
                        .json({ error: "Use POST method only." });
                }

                const { userEmail, movieId } = req.body;
                if (!userEmail || !movieId) {
                    return res.status(400).json({
                        error: "User email and movie ID are required.",
                    });
                }

                // Remove from watchlist in Firestore
                const movieRef = db
                    .collection("users")
                    .doc(userEmail)
                    .collection("lists")
                    .doc("watchlist")
                    .collection("movies")
                    .doc(movieId);

                await movieRef.delete();

                res.json({ success: true });
            } catch (error) {
                logger.error("Error removing from watchlist:", error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }
);

// Rate any movie (not just in lists)
exports.rateMovie = onRequest(
    {
        maxInstances: 20,
        timeoutSeconds: 30,
        memory: "256MiB",
    },
    async (req, res) => {
        return cors(req, res, async () => {
            try {
                logger.info("=== rateMovie function called ===", {
                    timestamp: new Date().toISOString(),
                    method: req.method,
                });

                if (req.method !== "POST") {
                    return res
                        .status(405)
                        .json({ error: "Use POST method only." });
                }

                const { userEmail, movieId, movieData, rating } = req.body;
                if (!userEmail || !movieId || rating === undefined) {
                    return res.status(400).json({
                        error: "User email, movie ID, and rating are required.",
                    });
                }

                // Store rating in watchHistory collection
                const historyRef = db
                    .collection("users")
                    .doc(userEmail)
                    .collection("watchHistory")
                    .doc(movieId);

                // First check if movie exists in watch history
                const historyDoc = await historyRef.get();

                if (historyDoc.exists) {
                    // Update existing watch history entry with rating
                    await historyRef.update({
                        userRating: rating,
                        ratedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                } else {
                    // Create new watch history entry with rating (for movies rated without being watched)
                    await historyRef.set({
                        ...movieData,
                        userRating: rating,
                        ratedAt: admin.firestore.FieldValue.serverTimestamp(),
                        watchedAt: null, // Not watched yet, just rated
                        completedPercentage: 0,
                        deviceType: "chrome-extension",
                    });
                }

                logger.info(
                    "Rating saved to watchHistory only - no sync needed"
                );

                res.json({ success: true });
            } catch (error) {
                logger.error("Error rating movie:", error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }
);

// Get user rating for any movie
exports.getUserRating = onRequest(
    {
        maxInstances: 20,
        timeoutSeconds: 30,
        memory: "256MiB",
    },
    async (req, res) => {
        return cors(req, res, async () => {
            try {
                logger.info("=== getUserRating function called ===", {
                    timestamp: new Date().toISOString(),
                    method: req.method,
                });

                if (req.method !== "POST") {
                    return res
                        .status(405)
                        .json({ error: "Use POST method only." });
                }

                const { userEmail, movieId } = req.body;
                if (!userEmail || !movieId) {
                    return res.status(400).json({
                        error: "User email and movie ID are required.",
                    });
                }

                // Get rating from watchHistory collection
                const historyDoc = await db
                    .collection("users")
                    .doc(userEmail)
                    .collection("watchHistory")
                    .doc(movieId)
                    .get();

                if (historyDoc.exists) {
                    const historyData = historyDoc.data();
                    res.json({
                        success: true,
                        rating: historyData.userRating || 0,
                    });
                } else {
                    res.json({ success: true, rating: 0 });
                }
            } catch (error) {
                logger.error("Error getting user rating:", error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }
);
