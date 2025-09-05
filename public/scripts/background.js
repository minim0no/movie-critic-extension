/* global chrome */

// Background script for handling movie data requests

// TMDb genre mapping
const genreMap = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
};

function getGenreName(genreId) {
    return genreMap[genreId] || "Unknown";
}

// Promise-based function for handling movie data requests with caching
async function handleMovieDataRequestPromise(movieName, movieYear) {
    // First, check cache before making any API calls
    // Create a more robust cache key that preserves important characters
    const cacheKey = `movie-${movieName
        .toLowerCase()
        .replace(/[^a-z0-9\s.-]/g, "")
        .replace(/\s+/g, "-")}_${movieYear?.substring(0, 4) || "any"}`;

    // Check cache first
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(cacheKey, async (storageResult) => {
            try {
                const cachedData = storageResult[cacheKey]
                    ? JSON.parse(storageResult[cacheKey])
                    : null;

                if (cachedData && cachedData.data.Response !== "False") {
                    const age = Date.now() - cachedData.timestamp;
                    const oneDay = 24 * 60 * 60 * 1000;

                    if (age < oneDay) {
                        // Return cached data if it's still fresh
                        console.log("Returning cached data");
                        resolve({ movieData: cachedData.data });
                        return;
                    } else {
                        // Clear expired cache
                        clearExpiredCachedMovies();
                    }
                }

                // If no valid cache, call Firebase function
                console.log("No valid cache, calling Firebase function");
                console.log("Original movie name:", movieName);
                console.log("Cache key:", cacheKey);

                const functionUrl =
                    "https://us-central1-movie-chrome-extension-a68f2.cloudfunctions.net/getMovieData";

                // Build query parameters
                const params = new URLSearchParams();
                params.append("movieName", movieName);
                if (movieYear) params.append("movieYear", movieYear);

                console.log(
                    "Final URL:",
                    `${functionUrl}?${params.toString()}`
                );
                console.log("Request details:", {
                    movieName: movieName,
                    movieYear: movieYear,
                    params: params.toString(),
                    fullUrl: `${functionUrl}?${params.toString()}`,
                });

                const response = await fetch(
                    `${functionUrl}?${params.toString()}`,
                    {
                        method: "GET",
                    }
                );

                console.log("Response status:", response.status);
                console.log(
                    "Response headers:",
                    Object.fromEntries(response.headers.entries())
                );

                const result = await response.json();
                console.log("Firebase function response:", result);

                // Cache the successful response
                if (result.success && result.data.Response === "True") {
                    chrome.storage.local.set({
                        [cacheKey]: JSON.stringify({
                            data: result.data,
                            timestamp: Date.now(),
                        }),
                    });
                }

                // Return the data in the expected format
                resolve({ movieData: result.data });
            } catch (error) {
                reject(error);
            }
        });
    });
}

// Normalize movie data from different APIs to consistent format
function normalizeMovieData(movieData, source = "omdb") {
    if (source === "tmdb") {
        // Safely handle vote_average to prevent toFixed errors
        let rating = "N/A";
        if (
            movieData.vote_average !== undefined &&
            movieData.vote_average !== null
        ) {
            try {
                const numRating = parseFloat(movieData.vote_average);
                if (!isNaN(numRating)) {
                    rating = `${numRating.toFixed(1)}/10`;
                }
            } catch (e) {
                console.warn("Error formatting TMDb rating:", e);
                rating = "N/A";
            }
        }

        return {
            id: movieData.id || `tmdb-${Date.now()}-${Math.random()}`, // Unique ID for TMDb movies
            title: movieData.title || movieData.name || "Unknown Title",
            year: movieData.release_date
                ? movieData.release_date.split("-")[0]
                : "Unknown Year",
            plot: movieData.overview || "No description available",
            poster: movieData.poster_path
                ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
                : "N/A",
            rating: rating,
            ratingValue: movieData.vote_average || 0, // Numeric value for sorting/calculations
            genre: movieData.genre_ids
                ? movieData.genre_ids.map((id) => getGenreName(id))
                : [],
            director: "Director info not available",
            actors: "Cast info not available",
            language: movieData.original_language
                ? movieData.original_language.toUpperCase()
                : "EN",
            boxOffice: "Box office info not available",
            response: "True",
            source: "TMDb",
        };
    } else {
        // OMDB data normalization
        let rating = "N/A";
        if (
            movieData.imdbRating !== undefined &&
            movieData.imdbRating !== null
        ) {
            try {
                const numRating = parseFloat(movieData.imdbRating);
                if (!isNaN(numRating)) {
                    rating = `${numRating}/10`;
                }
            } catch (e) {
                console.warn("Error formatting OMDB rating:", e);
                rating = "N/A";
            }
        }

        return {
            id: movieData.imdbID || `omdb-${Date.now()}-${Math.random()}`, // Unique ID for OMDB movies
            title: movieData.Title || "Unknown Title",
            year: movieData.Year || "Unknown Year",
            plot: movieData.Plot || "No description available",
            poster: movieData.Poster || "N/A",
            rating: rating,
            ratingValue: movieData.imdbRating
                ? parseFloat(movieData.imdbRating)
                : 0, // Numeric value for sorting/calculations
            imdbVotes: movieData.imdbVotes || "N/A", // Add IMDb vote count
            genre: movieData.Genre
                ? movieData.Genre.split(", ").filter(Boolean)
                : [],
            director: movieData.Director || "N/A",
            actors: movieData.Actors || "N/A",
            language: movieData.Language || "EN",
            boxOffice: movieData.BoxOffice || "N/A",
            awards: movieData.Awards || "N/A", // Add awards
            rated: movieData.Rated || "N/A", // Add rating (PG, R, etc.)
            runtime: movieData.Runtime || "N/A", // Add runtime
            response: movieData.Response || "False",
            source: "OMDB",
        };
    }
}

// Get trending movies from TMDb and enrich with OMDB data
async function getTrendingMovies() {
    try {
        // Check cache first
        const cacheKey = "trending-movies-cache";
        const cached = await new Promise((resolve) => {
            chrome.storage.local.get(cacheKey, (result) =>
                resolve(result[cacheKey])
            );
        });

        if (cached && cached.timestamp) {
            const oneDay = 24 * 60 * 60 * 1000;
            if (Date.now() - cached.timestamp < oneDay) {
                console.log("Returning cached trending movies");
                return cached.movies;
            }
        }

        // Fetch fresh data if cache is expired or doesn't exist
        console.log(
            "Fetching fresh trending movies from TMDb and enriching with OMDB data"
        );
        const functionUrl =
            "https://us-central1-movie-chrome-extension-a68f2.cloudfunctions.net/getTrendingMovies";
        const response = await fetch(functionUrl, { method: "GET" });
        const result = await response.json();

        if (result.success && result.data) {
            // Get basic movie info from TMDb and enrich with OMDB data
            const enrichedMovies = [];

            for (const tmdbMovie of result.data) {
                try {
                    // Search OMDB using title and year as separate parameters
                    const movieTitle = tmdbMovie.title;
                    const movieYear =
                        tmdbMovie.release_date?.split("-")[0] || "";

                    console.log(
                        `Enriching movie: ${movieTitle} (${movieYear})`
                    );

                    const omdbResult = await handleMovieDataRequestPromise(
                        movieTitle,
                        movieYear
                    );

                    if (
                        omdbResult.movieData &&
                        omdbResult.movieData.Response === "True"
                    ) {
                        // Use OMDB data as primary source
                        console.log(`Successfully enriched: ${movieTitle}`);
                        const enrichedMovie = normalizeMovieData(
                            omdbResult.movieData,
                            "omdb"
                        );
                        enrichedMovies.push(enrichedMovie);
                    } else {
                        // Fallback to TMDb data if OMDB search fails
                        console.warn(
                            `OMDB search failed for: ${movieTitle} (${movieYear}), using TMDb fallback`
                        );
                        const fallbackMovie = normalizeMovieData(
                            tmdbMovie,
                            "tmdb"
                        );
                        enrichedMovies.push(fallbackMovie);
                    }

                    // Small delay to avoid overwhelming OMDB API
                    await new Promise((resolve) => setTimeout(resolve, 100));
                } catch (error) {
                    console.warn(
                        `Error enriching movie ${tmdbMovie.title}:`,
                        error
                    );
                    // Fallback to TMDb data
                    const fallbackMovie = normalizeMovieData(tmdbMovie, "tmdb");
                    enrichedMovies.push(fallbackMovie);
                }
            }

            // Cache the enriched results with timestamp
            const cacheData = {
                movies: enrichedMovies,
                timestamp: Date.now(),
            };
            await new Promise((resolve) => {
                chrome.storage.local.set({ [cacheKey]: cacheData }, resolve);
            });

            return enrichedMovies;
        }
        return [];
    } catch (error) {
        console.error("Error fetching trending movies:", error);
        return [];
    }
}

// Get top-rated movies from TMDb and enrich with OMDB data
async function getTopRatedMovies() {
    try {
        // Check cache first
        const cacheKey = "top-rated-movies-cache";
        const cached = await new Promise((resolve) => {
            chrome.storage.local.get(cacheKey, (result) =>
                resolve(result[cacheKey])
            );
        });

        if (cached && cached.timestamp) {
            const oneDay = 24 * 60 * 60 * 1000;
            if (Date.now() - cached.timestamp < oneDay) {
                console.log("Returning cached top-rated movies");
                return cached.movies;
            }
        }

        // Fetch fresh data if cache is expired or doesn't exist
        console.log(
            "Fetching fresh top-rated movies from TMDb and enriching with OMDB data"
        );
        const functionUrl =
            "https://us-central1-movie-chrome-extension-a68f2.cloudfunctions.net/getTopRatedMovies";
        const response = await fetch(functionUrl, { method: "GET" });
        const result = await response.json();

        if (result.success && result.data) {
            // Get basic movie info from TMDb and enrich with OMDB data
            const enrichedMovies = [];

            for (const tmdbMovie of result.data) {
                try {
                    // Search OMDB using title and year as separate parameters
                    const movieTitle = tmdbMovie.title;
                    const movieYear =
                        tmdbMovie.release_date?.split("-")[0] || "";

                    console.log(
                        `Enriching movie: ${movieTitle} (${movieYear})`
                    );

                    const omdbResult = await handleMovieDataRequestPromise(
                        movieTitle,
                        movieYear
                    );

                    if (
                        omdbResult.movieData &&
                        omdbResult.movieData.Response === "True"
                    ) {
                        // Use OMDB data as primary source
                        console.log(`Successfully enriched: ${movieTitle}`);
                        const enrichedMovie = normalizeMovieData(
                            omdbResult.movieData,
                            "omdb"
                        );
                        enrichedMovies.push(enrichedMovie);
                    } else {
                        // Fallback to TMDb data if OMDB search fails
                        console.warn(
                            `OMDB search failed for: ${movieTitle} (${movieYear}), using TMDb fallback`
                        );
                        const fallbackMovie = normalizeMovieData(
                            tmdbMovie,
                            "tmdb"
                        );
                        enrichedMovies.push(fallbackMovie);
                    }

                    // Small delay to avoid overwhelming OMDB API
                    await new Promise((resolve) => setTimeout(resolve, 100));
                } catch (error) {
                    console.warn(
                        `Error enriching movie ${tmdbMovie.title}:`,
                        error
                    );
                    // Fallback to TMDb data
                    const fallbackMovie = normalizeMovieData(tmdbMovie, "tmdb");
                    enrichedMovies.push(fallbackMovie);
                }
            }

            // Cache the enriched results with timestamp
            const cacheData = {
                movies: enrichedMovies,
                timestamp: Date.now(),
            };
            await new Promise((resolve) => {
                chrome.storage.local.set({ [cacheKey]: cacheData }, resolve);
            });

            return enrichedMovies;
        }
        return [];
    } catch (error) {
        console.error("Error fetching top-rated movies:", error);
        return [];
    }
}

// Search movies with OMDB priority
async function searchMovies(query) {
    try {
        // Always search OMDB first for consistent data
        console.log("Searching OMDB for:", query);
        const omdbResult = await handleMovieDataRequestPromise(query);
        if (omdbResult.movieData && omdbResult.movieData.Response === "True") {
            return [normalizeMovieData(omdbResult.movieData, "omdb")];
        }

        // If OMDB search fails, check trending movies as fallback
        console.log(
            "OMDB search failed, checking trending movies as fallback..."
        );
        const trendingMovies = await getTrendingMovies();
        const filteredTrending = trendingMovies.filter((movie) =>
            movie.title.toLowerCase().includes(query.toLowerCase())
        );

        if (filteredTrending.length > 0) {
            console.log("Found movies in trending list:", filteredTrending);
            return filteredTrending;
        }

        return [];
    } catch (error) {
        console.error("Error in searchMovies:", error);
        return [];
    }
}

function clearExpiredCachedMovies() {
    chrome.storage.local.get(null, (items) => {
        const keys = Object.keys(items);

        const movieKeys = keys.filter(
            (key) =>
                key.startsWith("movie-") ||
                key.includes("_") ||
                key.includes("-cache")
        );

        if (movieKeys.length > 0) {
            try {
                movieKeys.forEach((key) => {
                    const cached = JSON.parse(items[key]);
                    const oneDay = 24 * 60 * 60 * 1000;
                    if (
                        cached.timestamp &&
                        Date.now() - cached.timestamp > oneDay
                    ) {
                        chrome.storage.local.remove(key);
                        console.log(`Cleared expired cache: ${key}`);
                    }
                });
            } catch (e) {
                // Skip malformed entries
                console.warn(`Failed to parse cached item`, e);
            }
        }
    });
}

// Get AI critique for a movie
async function getAICritique(movieName) {
    try {
        // First get movie data to send comprehensive information to AI
        const movieDataResult = await handleMovieDataRequestPromise(movieName);

        if (
            !movieDataResult.movieData ||
            movieDataResult.movieData.Response !== "True"
        ) {
            throw new Error("Could not find movie data for AI critique");
        }

        const movieData = movieDataResult.movieData;

        // Check cache first
        const cacheKey = `ai-critique-${movieName
            .toLowerCase()
            .replace(/[^a-z0-9\s.-]/g, "")
            .replace(/\s+/g, "-")}`;
        const cached = await new Promise((resolve) => {
            chrome.storage.local.get(cacheKey, (result) =>
                resolve(result[cacheKey])
            );
        });

        if (cached && cached.timestamp) {
            const oneWeek = 7 * 24 * 60 * 60 * 1000; // Cache AI critiques for a week
            if (Date.now() - cached.timestamp < oneWeek) {
                console.log("Returning cached AI critique");
                return cached.critique;
            }
        }

        // Call Firebase function for AI critique
        console.log("Fetching fresh AI critique from Firebase function");
        const functionUrl =
            "https://us-central1-movie-chrome-extension-a68f2.cloudfunctions.net/getAICritique";

        const response = await fetch(functionUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                movieData: movieData,
            }),
        });

        const result = await response.json();
        console.log("AI critique Firebase function response:", result);

        if (result.success && result.critique) {
            // Cache the AI critique
            const cacheData = {
                critique: result.critique,
                timestamp: Date.now(),
            };
            await new Promise((resolve) => {
                chrome.storage.local.set({ [cacheKey]: cacheData }, resolve);
            });

            return result.critique;
        } else {
            throw new Error(result.error || "Failed to get AI critique");
        }
    } catch (error) {
        console.error("Error getting AI critique:", error);
        throw error;
    }
}

// Save user rating for a movie
async function saveUserRating(movieTitle, rating) {
    try {
        const ratingKey = `user-rating-${movieTitle
            .toLowerCase()
            .replace(/[^a-z0-9\s.-]/g, "")
            .replace(/\s+/g, "-")}`;
        const ratingData = {
            movieTitle: movieTitle,
            rating: rating,
            timestamp: Date.now(),
        };

        await new Promise((resolve) => {
            chrome.storage.local.set({ [ratingKey]: ratingData }, resolve);
        });

        console.log(`Saved user rating for ${movieTitle}: ${rating}/5`);
    } catch (error) {
        console.error("Error saving user rating:", error);
        throw error;
    }
}

// Get user rating for a movie
async function getUserRating(movieTitle) {
    try {
        const ratingKey = `user-rating-${movieTitle
            .toLowerCase()
            .replace(/[^a-z0-9\s.-]/g, "")
            .replace(/\s+/g, "-")}`;
        const result = await new Promise((resolve) => {
            chrome.storage.local.get(ratingKey, (result) =>
                resolve(result[ratingKey])
            );
        });

        return result ? result.rating : 0; // Return 0 if no rating found
    } catch (error) {
        console.error("Error getting user rating:", error);
        throw error;
    }
}

// Get user ratings for multiple movies (bulk operation)
async function getUserRatings(movieTitles) {
    try {
        const ratings = {};

        for (const movieTitle of movieTitles) {
            const rating = await getUserRating(movieTitle);
            ratings[movieTitle] = rating;
        }

        return ratings;
    } catch (error) {
        console.error("Error getting user ratings:", error);
        throw error;
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle popup opening requests
    if (message.action === "openPopup") {
        // Store the requested view in storage so the popup can read it
        chrome.storage.local.set({ requestedView: message.view }, () => {
            // Open the popup
            chrome.action.openPopup();
        });
        return;
    }

    // Handle movie data requests (consolidated approach)
    if (message.movieName && message.type === "MovieQuery") {
        // This is a movie query from the popup script, handle it with caching
        console.log("Received movie query:", message);

        // Use a Promise-based approach for better async handling
        handleMovieDataRequestPromise(message.movieName, message.movieYear)
            .then((result) => {
                console.log("Sending response:", result);
                sendResponse(result);
            })
            .catch((error) => {
                console.error("Error in movie request:", error);
                sendResponse({ error: error.message });
            });

        return true; // Keep the message channel open
    }

    // Handle trending movies request
    if (message.type === "GetTrendingMovies") {
        console.log("Received trending movies request");
        getTrendingMovies()
            .then((movies) => {
                console.log("Sending trending movies:", movies);
                sendResponse({ success: true, movies });
            })
            .catch((error) => {
                console.error("Error getting trending movies:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    // Handle top-rated movies request
    if (message.type === "GetTopRatedMovies") {
        console.log("Received top-rated movies request");
        getTopRatedMovies()
            .then((movies) => {
                console.log("Sending top-rated movies:", movies);
                sendResponse({ success: true, movies });
            })
            .catch((error) => {
                console.error("Error getting top-rated movies:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    // Handle search request with fallback logic
    if (message.query && message.type === "SearchMovies") {
        console.log("Received search request:", message.query);
        searchMovies(message.query)
            .then((movies) => {
                console.log("Sending search results:", movies);
                sendResponse({ success: true, movies });
            })
            .catch((error) => {
                console.error("Error searching movies:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    // Handle cache clearing request
    if (message.type === "ClearCache") {
        console.log("Received cache clear request");
        try {
            chrome.storage.local.clear(() => {
                console.log("Cache cleared successfully");
                sendResponse({
                    success: true,
                    message: "Cache cleared successfully",
                });
            });
        } catch (error) {
            console.error("Error clearing cache:", error);
            sendResponse({ success: false, error: error.message });
        }
        return true;
    }

    // Handle AI critique request
    if (message.type === "GetAICritique") {
        console.log("Received AI critique request for:", message.movieName);
        getAICritique(message.movieName)
            .then((critique) => {
                console.log("Sending AI critique:", critique);
                sendResponse({ success: true, critique });
            })
            .catch((error) => {
                console.error("Error getting AI critique:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    // Handle user rating storage
    if (message.type === "SaveUserRating") {
        console.log("Received save user rating request:", message);
        saveUserRating(message.movieTitle, message.rating)
            .then(() => {
                console.log("User rating saved successfully");
                sendResponse({ success: true });
            })
            .catch((error) => {
                console.error("Error saving user rating:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    // Handle user rating retrieval
    if (message.type === "GetUserRating") {
        console.log(
            "Received get user rating request for:",
            message.movieTitle
        );
        getUserRating(message.movieTitle)
            .then((rating) => {
                console.log("Sending user rating:", rating);
                sendResponse({ success: true, rating });
            })
            .catch((error) => {
                console.error("Error getting user rating:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    // Handle bulk user ratings retrieval
    if (message.type === "GetUserRatings") {
        console.log(
            "Received get user ratings request for:",
            message.movieTitles
        );
        getUserRatings(message.movieTitles)
            .then((ratings) => {
                console.log("Sending user ratings:", ratings);
                sendResponse({ success: true, ratings });
            })
            .catch((error) => {
                console.error("Error getting user ratings:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    // Firestore integration handlers
    if (message.type === "GET_USER_LISTS") {
        console.log(
            "Received get user lists request for user:",
            message.data.userEmail
        );
        getUserLists(message.data.userEmail)
            .then((result) => {
                sendResponse(result);
            })
            .catch((error) => {
                console.error("Error getting user lists:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    if (message.type === "ADD_TO_WATCH_HISTORY") {
        console.log(
            "Received add to watch history request for user:",
            message.data.userEmail
        );
        addToWatchHistory(message.data.userEmail, message.data.movieData)
            .then((result) => {
                sendResponse(result);
            })
            .catch((error) => {
                console.error("Error adding to watch history:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    if (message.type === "ADD_MOVIE_TO_LIST") {
        console.log("Received add movie to list request:", message.data);
        addMovieToList(
            message.data.userEmail,
            message.data.listId,
            message.data.movieData
        )
            .then((result) => {
                sendResponse(result);
            })
            .catch((error) => {
                console.error("Error adding movie to list:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    // RATE_MOVIE_IN_LIST is deprecated - use RATE_MOVIE only

    // New dedicated rating system - rate any movie
    if (message.type === "RATE_MOVIE") {
        console.log("Received rate movie request:", message.data);
        rateMovie(
            message.data.userEmail,
            message.data.movieId,
            message.data.movieData,
            message.data.rating
        )
            .then((result) => {
                sendResponse(result);
            })
            .catch((error) => {
                console.error("Error in rate movie:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    // New dedicated rating system - get rating for any movie
    if (message.type === "GET_MOVIE_RATING") {
        console.log("Received get movie rating request:", message.data);
        getUserMovieRating(message.data.userEmail, message.data.movieId)
            .then((result) => {
                sendResponse(result);
            })
            .catch((error) => {
                console.error("Error getting movie rating:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    // Get user watchlist from database
    if (message.type === "GET_USER_WATCHLIST") {
        console.log(
            "Received get user watchlist request for:",
            message.data.userEmail
        );
        getUserWatchlist(message.data.userEmail)
            .then((result) => {
                sendResponse(result);
            })
            .catch((error) => {
                console.error("Error getting user watchlist:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    // Remove movie from watchlist
    if (message.type === "REMOVE_FROM_WATCHLIST") {
        console.log("Received remove from watchlist request:", message.data);
        removeFromWatchlist(message.data.userEmail, message.data.movieId)
            .then((result) => {
                sendResponse(result);
            })
            .catch((error) => {
                console.error("Error removing from watchlist:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    return true;
});

// Firestore integration functions (using Firebase Functions)
async function getUserLists(userEmail) {
    try {
        const response = await fetch(
            "https://us-central1-movie-chrome-extension-a68f2.cloudfunctions.net/getUserLists",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userEmail }),
            }
        );

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error getting user lists:", error);
        // Fallback to local storage
        const mockLists = [
            { id: "watchlist", name: "My Watchlist", movies: [] },
            { id: "favorites", name: "Favorites", movies: [] },
            { id: "to-watch", name: "To Watch Later", movies: [] },
        ];
        return { success: true, lists: mockLists };
    }
}

async function addToWatchHistory(userEmail, movieData) {
    try {
        const response = await fetch(
            "https://us-central1-movie-chrome-extension-a68f2.cloudfunctions.net/addToWatchHistory",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userEmail, movieData }),
            }
        );

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error adding to watch history:", error);
        // Fallback to local storage
        const historyKey = `watch-history-${userEmail}`;
        const storageResult = await chrome.storage.local.get([historyKey]);
        const history = storageResult[historyKey] || [];

        const filteredHistory = history.filter(
            (item) => item.imdbId !== movieData.imdbId
        );
        filteredHistory.unshift({
            ...movieData,
            watchedAt: new Date().toISOString(),
        });

        const updatedHistory = filteredHistory.slice(0, 100);
        await chrome.storage.local.set({
            [historyKey]: updatedHistory,
        });

        return { success: true };
    }
}

async function addMovieToList(userEmail, listId, movieData) {
    try {
        const response = await fetch(
            "https://us-central1-movie-chrome-extension-a68f2.cloudfunctions.net/addMovieToList",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userEmail, listId, movieData }),
            }
        );

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error adding movie to list:", error);
        // Fallback to local storage
        const listKey = `list-${userEmail}-${listId}`;
        const storageResult = await chrome.storage.local.get([listKey]);
        const movies = storageResult[listKey] || [];

        const existingIndex = movies.findIndex(
            (movie) =>
                movie.imdbId === movieData.imdbId ||
                movie.title.toLowerCase() === movieData.title.toLowerCase()
        );

        if (existingIndex === -1) {
            movies.push({
                ...movieData,
                addedAt: new Date().toISOString(),
                userRating: null,
            });

            await chrome.storage.local.set({
                [listKey]: movies,
            });
        }

        return { success: true };
    }
}

async function rateMovieInList(userEmail, listId, movieId, rating) {
    try {
        const response = await fetch(
            "https://us-central1-movie-chrome-extension-a68f2.cloudfunctions.net/rateMovieInList",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userEmail, listId, movieId, rating }),
            }
        );

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error rating movie in list:", error);
        // Fallback to local storage
        const listKey = `list-${userEmail}-${listId}`;
        const storageResult = await chrome.storage.local.get([listKey]);
        const movies = storageResult[listKey] || [];

        const movieIndex = movies.findIndex(
            (movie) => movie.imdbId === movieId || movie.id === movieId
        );

        if (movieIndex !== -1) {
            movies[movieIndex].userRating = rating;
            movies[movieIndex].ratedAt = new Date().toISOString();

            await chrome.storage.local.set({
                [listKey]: movies,
            });
        }

        return { success: true };
    }
}

async function getUserWatchlist(userEmail) {
    try {
        const response = await fetch(
            "https://us-central1-movie-chrome-extension-a68f2.cloudfunctions.net/getUserWatchlist",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userEmail }),
            }
        );

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error getting user watchlist:", error);
        // Fallback to local storage
        const listKey = `list-${userEmail}-watchlist`;
        const storageResult = await chrome.storage.local.get([listKey]);
        const movies = storageResult[listKey] || [];

        return { success: true, watchlist: movies };
    }
}

async function removeFromWatchlist(userEmail, movieId) {
    try {
        const response = await fetch(
            "https://us-central1-movie-chrome-extension-a68f2.cloudfunctions.net/removeFromWatchlist",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userEmail, movieId }),
            }
        );

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error removing from watchlist:", error);
        // Fallback to local storage
        const listKey = `list-${userEmail}-watchlist`;
        const storageResult = await chrome.storage.local.get([listKey]);
        const movies = storageResult[listKey] || [];

        const filteredMovies = movies.filter(
            (movie) => movie.imdbId !== movieId && movie.id !== movieId
        );

        await chrome.storage.local.set({
            [listKey]: filteredMovies,
        });

        return { success: true };
    }
}

// Rate any movie (dedicated rating system)
async function rateMovie(userEmail, movieId, movieData, rating) {
    try {
        const payload = { userEmail, movieId, movieData, rating };
        console.log("🔥 BACKGROUND - Sending to Firebase rateMovie:", {
            userEmail,
            movieId,
            rating,
            hasMovieData: !!movieData,
            movieTitle: movieData?.title || movieData?.Title,
        });

        const response = await fetch(
            "https://us-central1-movie-chrome-extension-a68f2.cloudfunctions.net/rateMovie",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        console.log(
            "🔥 BACKGROUND - Firebase response status:",
            response.status
        );
        const result = await response.json();
        console.log("🔥 BACKGROUND - Firebase response data:", result);
        return result;
    } catch (error) {
        console.error("Error rating movie:", error);
        // Fallback to local storage
        const ratingKey = `rating-cache-${movieId}`;
        await chrome.storage.local.set({
            [ratingKey]: { rating, timestamp: Date.now() },
        });
        return { success: true };
    }
}

// Get user rating for any movie (dedicated rating system)
async function getUserMovieRating(userEmail, movieId) {
    try {
        const response = await fetch(
            "https://us-central1-movie-chrome-extension-a68f2.cloudfunctions.net/getUserRating",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userEmail, movieId }),
            }
        );

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error getting user rating:", error);
        // Fallback to local storage
        const ratingKey = `rating-cache-${movieId}`;
        const storageResult = await chrome.storage.local.get([ratingKey]);
        const ratingData = storageResult[ratingKey];

        return {
            success: true,
            rating: ratingData ? ratingData.rating : 0,
        };
    }
}
