const API_KEY = "";

let movie = {};

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
    const cacheKey = `${movie.name.toLowerCase()}_${
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
                chrome.storage.local.remove(cacheKey);
            }
        }

        getMovieData()
            .then((data) => {
                console.log("API response received:", data);
                if (data.Response === "True") {
                    chrome.storage.local.set({
                        [cacheKey]: JSON.stringify({
                            data,
                            timestamp: Date.now(),
                        }),
                    });
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
