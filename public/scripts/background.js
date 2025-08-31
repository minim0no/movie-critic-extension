const API_KEY = "9cf2137a";

let movie = {};

function clearExpiredCachedMovies() {
    chrome.storage.local.get(null, (items) => {
        const keys = Object.keys(items);

        const movieKeys = keys.filter(
            (key) => key.startsWith("movie-") || key.includes("_")
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
                    }
                });
            } catch (e) {
                // Skip malformed entries
                console.warn(`Failed to parse cached movie}`, e);
            }
        }
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    movie.name = message.movieName;
    if (message.movieYear != null) {
        movie.year = message.movieYear;
    }

    async function getMovieData() {
        const movieQuery = movie.name.split(" ").join("+");
        const url = `https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(
            movieQuery
        )}&plot=full&y=${movie.year || ""}`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
    const cacheKey = `movie-${movie.name.toLowerCase()}_${
        movie.year?.substring(0, 4) || "any"
    }`;

    chrome.storage.local.get(cacheKey, (result) => {
        const cachedData = result[cacheKey]
            ? JSON.parse(result[cacheKey])
            : null;

        if (cachedData && cachedData.data.Response !== "False") {
            const age = Date.now() - cachedData.timestamp;
            const oneDay = 24 * 60 * 60 * 1000;

            if (age < oneDay) {
                sendResponse({ movieData: cachedData.data });
                return;
            } else {
                clearExpiredCachedMovies();
            }
        }

        getMovieData()
            .then((data) => {
                console.log("API response received:", data);
                try {
                    if (data.Response === "True") {
                        chrome.storage.local.set({
                            [cacheKey]: JSON.stringify({
                                data,
                                timestamp: Date.now(),
                            }),
                        });
                    }
                } catch (e) {
                    console.error("Error caching movie data:", e);
                }

                sendResponse({ movieData: data });
            })
            .catch((err) => {
                console.error("Error fetching movie data:", err);
                sendResponse({ error: err.message });
            });
    });

    return true;
});
