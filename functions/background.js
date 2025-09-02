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
    const cacheKey = `movie-${movieName.toLowerCase().replace(/[^a-z0-9\s.-]/g, "").replace(/\s+/g, "-")}_${
        movieYear?.substring(0, 4) || "any"
    }`;

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

    return true;
});
