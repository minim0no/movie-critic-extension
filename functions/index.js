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
            if (req.method !== "GET") {
                return res.status(405).json({ error: "Use GET method only." });
            }

            const { movieName, movieYear } = req.query;
            if (!movieName) {
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

            const { data } = await axios.get(url);

            res.json({
                success: true,
                data,
            });
        } catch (err) {
            logger.error(err.message, { stack: err.stack });
            res.status(500).json({ success: false, error: err.message });
        }
    });
});
