const API_KEY = "d7786aee";

let movie = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(
        sender.tab
            ? "from a content script: " + sender.tab.url
            : "from the extension"
    );

    movie.name = message.movieName;
    if (message.movieYear != null) {
        movie.year = message.movieYear;
    }

    console.log("Data received: " + movie.name + " " + movie.year);

    async function getMovieData() {
        const movieQuery = movie.name.split(" ").join("+");
        const url = `https://www.omdbapi.com/?apikey=${API_KEY}&t=${movieQuery}&plot=full&y=${
            movie.year || ""
        }`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }

    getMovieData()
        .then((data) => {
            console.log("API response received:", data);
            sendResponse({ movieData: data });
        })
        .catch((err) => {
            console.error("Error fetching movie data:", err);
            sendResponse({ error: err.message });
        });

    return true;
});
