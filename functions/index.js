const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");
const axios = require("axios");
const cors = require("cors")({ origin: true });

setGlobalOptions({ maxInstances: 10 });

exports.getMovieData = onRequest(async (req, res) => {
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
                return res.status(405).json({ error: "Use GET method only." });
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
});

// Get trending movies from TMDb
exports.getTrendingMovies = onRequest(async (req, res) => {
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
                return res.status(405).json({ error: "Use GET method only." });
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
                    Authorization: `Bearer ${TMDB_API_KEY.substring(0, 20)}...`,
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
});

// Get top-rated movies from TMDb
exports.getTopRatedMovies = onRequest(async (req, res) => {
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
                return res.status(405).json({ error: "Use GET method only." });
            }

            logger.info("Checking TMDb API key configuration for top-rated");
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
                    Authorization: `Bearer ${TMDB_API_KEY.substring(0, 20)}...`,
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
});
