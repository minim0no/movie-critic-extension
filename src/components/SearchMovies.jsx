import { useEffect, useState, useMemo } from "react";
import React from "react";
import Input from "./Input";
import { Search, Loader2 } from "lucide-react";
import Sidebar from "./Sidebar";
import { MovieCard } from "./MovieCard";

function SearchMovies({
    onAddToWatchlist,
    onRemoveFromWatchlist,
    watchlist = [],
    onViewMovieDetails,
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("rating");
    const [checkboxFilters, setCheckboxFilters] = useState({
        genre: {
            name: "🎭 Genre",
            options: {
                action: false,
                adventure: false,
                animation: false,
                biography: false,
                comedy: false,
                crime: false,
                documentary: false,
                drama: false,
                family: false,
                fantasy: false,
                history: false,
                horror: false,
                music: false,
                musical: false,
                mystery: false,
                romance: false,
                "sci-fi": false,
                sport: false,
                thriller: false,
                war: false,
                western: false,
            },
        },
        language: {
            name: "🌐 Language",
            options: {
                english: false,
                spanish: false,
                french: false,
                german: false,
                chinese: false,
                japanese: false,
                korean: false,
                hindi: false,
                arabic: false,
                portuguese: false,
                russian: false,
            },
        },
    });

    const [numberFilters, setNumberFilters] = useState({
        imdb: {
            name: "⭐ IMDb Ratings",
            min: 1,
            max: 10,
            startVal: "",
            endVal: "",
        },
        rotten: {
            name: "🍅 Rotten Tomatoes",
            min: 0,
            max: 100,
            startVal: "",
            endVal: "",
        },
        date: {
            name: "📅 Date Range",
            min: 1888,
            max: new Date().getFullYear(),
            startVal: "",
            endVal: "",
        },
    });

    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Map movies with watchlist status - include both search results and trending movies
    const allMovies = searchQuery ? searchResults : trendingMovies;
    const moviesWithWatchlistStatus = allMovies.map((movie) => ({
        ...movie,
        isInWatchlist: watchlist.some(
            (w) =>
                w.title === movie.title ||
                w.id === movie.id ||
                (w.imdbID && movie.imdbID && w.imdbID === movie.imdbID)
        ),
    }));

    // Search movies using the new API
    const performSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            setSearchError(null);

            const response = await chrome.runtime.sendMessage({
                type: "SearchMovies",
                query: query,
            });

            if (response.success && response.movies) {
                setSearchResults(response.movies);
            } else {
                setSearchResults([]);
                setSearchError("No movies found");
            }
        } catch (error) {
            console.error("Search error:", error);
            setSearchError("Search failed. Please try again.");
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const fetchTrendingMovies = async () => {
            try {
                setLoading(true);
                const response = await chrome.runtime.sendMessage({
                    type: "GetTrendingMovies",
                });

                if (response.success && response.movies) {
                    console.log("Received trending movies:", response.movies);
                    setTrendingMovies(response.movies);
                } else {
                    console.error("Failed to load trending movies:", response);
                    setError("Failed to load trending movies");
                }
            } catch (error) {
                console.error("Error fetching trending movies:", error);
                setError("Error loading trending movies");
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingMovies();
    }, []);

    // Perform search when query changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            performSearch(searchQuery);
        }, 500); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Filter movies based on search query and filters
    const filteredMovies = useMemo(() => {
        return moviesWithWatchlistStatus.filter((movie) => {
            // Search query filter
            const matchesSearch =
                !searchQuery ||
                movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (movie.genre &&
                    Array.isArray(movie.genre) &&
                    movie.genre.some((genre) =>
                        genre.toLowerCase().includes(searchQuery.toLowerCase())
                    )) ||
                (movie.genre &&
                    typeof movie.genre === "string" &&
                    movie.genre
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()));

            if (!matchesSearch) return false;

            // Checkbox filters
            const genreFilters = checkboxFilters.genre.options;
            const languageFilters = checkboxFilters.language.options;

            // Check if any genre filters are active
            const hasActiveGenreFilters =
                Object.values(genreFilters).some(Boolean);
            if (hasActiveGenreFilters) {
                let movieGenres = [];
                if (Array.isArray(movie.genre)) {
                    movieGenres = movie.genre.map((g) => g.toLowerCase());
                } else if (typeof movie.genre === "string") {
                    movieGenres = [movie.genre.toLowerCase()];
                }

                const matchesGenre = Object.entries(genreFilters).some(
                    ([genre, isChecked]) =>
                        isChecked &&
                        movieGenres.some((movieGenre) =>
                            movieGenre.includes(genre.toLowerCase())
                        )
                );
                if (!matchesGenre) return false;
            }

            // Check if any language filters are active
            const hasActiveLanguageFilters =
                Object.values(languageFilters).some(Boolean);
            if (hasActiveLanguageFilters) {
                const movieLanguage = movie.language?.toLowerCase() || "";
                const matchesLanguage = Object.entries(languageFilters).some(
                    ([language, isChecked]) =>
                        isChecked &&
                        movieLanguage.includes(language.toLowerCase())
                );
                if (!matchesLanguage) return false;
            }

            // Number filters
            // IMDb rating filter
            if (
                numberFilters.imdb.startVal !== "" ||
                numberFilters.imdb.endVal !== ""
            ) {
                const minRating =
                    parseFloat(numberFilters.imdb.startVal) ||
                    numberFilters.imdb.min;
                const maxRating =
                    parseFloat(numberFilters.imdb.endVal) ||
                    numberFilters.imdb.max;
                const movieRating = parseFloat(movie.ratingValue) || 0;

                if (movieRating < minRating || movieRating > maxRating)
                    return false;
            }

            // Year filter
            if (
                numberFilters.date.startVal !== "" ||
                numberFilters.date.endVal !== ""
            ) {
                const minYear =
                    parseInt(numberFilters.date.startVal) ||
                    numberFilters.date.min;
                const maxYear =
                    parseInt(numberFilters.date.endVal) ||
                    numberFilters.date.max;
                const movieYear = parseInt(movie.year) || 0;

                if (movieYear < minYear || movieYear > maxYear) return false;
            }

            return true;
        });
    }, [
        moviesWithWatchlistStatus,
        searchQuery,
        checkboxFilters,
        numberFilters,
    ]);

    // Sort filtered movies
    const sortedAndFilteredMovies = useMemo(() => {
        const sorted = [...filteredMovies];

        switch (sortOption) {
            case "newest":
                return sorted.sort((a, b) => b.year - a.year);
            case "oldest":
                return sorted.sort((a, b) => a.year - b.year);
            case "title-asc":
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case "title-desc":
                return sorted.sort((a, b) => b.title.localeCompare(a.title));
            case "rating":
            default:
                // For "popular", we'll sort by rating as a proxy for popularity
                return sorted.sort(
                    (a, b) => (b.ratingValue || 0) - (a.ratingValue || 0)
                );
        }
    }, [filteredMovies, sortOption]);

    useEffect(() => {
        console.log("SearchMovies - Filters changed:", {
            checkboxFilters,
            numberFilters,
        });
        console.log("SearchMovies - Search query:", searchQuery);
        console.log(
            "SearchMovies - Movies with watchlist status:",
            moviesWithWatchlistStatus.length
        );
        console.log("SearchMovies - Filtered movies:", filteredMovies.length);
        console.log(
            "SearchMovies - Sorted movies:",
            sortedAndFilteredMovies.length
        );
        console.log("SearchMovies - Sort option:", sortOption);
    }, [
        checkboxFilters,
        numberFilters,
        searchQuery,
        moviesWithWatchlistStatus,
        filteredMovies,
        sortedAndFilteredMovies,
        sortOption,
    ]);

    return (
        <div className="space-y-6 p-6 rounded-lg h-full overflow-y-auto">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
                />
            </div>
            <Sidebar
                checkboxFilters={checkboxFilters}
                numberFilters={numberFilters}
                setCheckboxFilters={setCheckboxFilters}
                setNumberFilters={setNumberFilters}
                sortOption={sortOption}
                setSortOption={setSortOption}
            />

            <div className="flex items-center justify-between mb-3">
                <span className="text-base font-medium">
                    {searchQuery ? "Search Results" : "Trending Movies"}
                </span>
                <span className="text-sm text-stone-500">
                    {searchQuery
                        ? `${sortedAndFilteredMovies.length} ${
                              sortedAndFilteredMovies.length === 1
                                  ? "item"
                                  : "items"
                          } found`
                        : `${trendingMovies.length} ${
                              trendingMovies.length === 1 ? "item" : "items"
                          } available`}
                </span>
            </div>

            {/* Loading State */}
            {isSearching && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
                    <span className="text-stone-600">Searching movies...</span>
                </div>
            )}

            {/* Error State */}
            {searchError && !isSearching && (
                <div className="text-center py-12 text-red-500">
                    <p>{searchError}</p>
                </div>
            )}

            {/* No Results */}
            {!isSearching &&
                !searchError &&
                sortedAndFilteredMovies.length === 0 &&
                searchQuery && (
                    <div className="text-center py-12 text-stone-500">
                        <p>No movies found for "{searchQuery}"</p>
                        <p className="text-sm mt-2">
                            Try searching for a different movie or check the
                            spelling
                        </p>
                    </div>
                )}

            {/* Loading State for Trending Movies */}
            {!searchQuery && loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
                    <span className="text-stone-600">
                        Loading trending movies...
                    </span>
                </div>
            )}

            {/* Error State for Trending Movies */}
            {!searchQuery && error && (
                <div className="text-center py-12 text-red-500">
                    <p>{error}</p>
                </div>
            )}

            {/* No Results */}
            {!isSearching &&
                !searchError &&
                sortedAndFilteredMovies.length === 0 &&
                searchQuery && (
                    <div className="text-center py-12 text-stone-500">
                        <p>No movies found for "{searchQuery}"</p>
                        <p className="text-sm mt-2">
                            Try searching for a different movie or check the
                            spelling
                        </p>
                    </div>
                )}

            {/* No Movies Available */}
            {!searchQuery &&
                !loading &&
                !error &&
                sortedAndFilteredMovies.length === 0 && (
                    <div className="text-center py-12 text-stone-500">
                        <p>No trending movies available</p>
                    </div>
                )}

            {/* Movie Grid */}
            {sortedAndFilteredMovies.length > 0 && (
                <div className="grid grid-cols-2 gap-3 pb-6">
                    {sortedAndFilteredMovies.map((movie) => (
                        <MovieCard
                            key={movie.title}
                            movie={movie}
                            onAddToWatchlist={onAddToWatchlist}
                            onRemoveFromWatchlist={onRemoveFromWatchlist}
                            onViewDetails={onViewMovieDetails}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchMovies;
