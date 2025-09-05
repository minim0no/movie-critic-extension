import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, TrendingUp, Award, Clock, Loader2 } from "lucide-react";
import { MovieCard } from "./MovieCard";

/* global chrome */

function RecommendedComponent({
    onAddToWatchlist,
    onRemoveFromWatchlist,
    watchlist = [],
    onViewMovieDetails,
}) {
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [topRatedMovies, setTopRatedMovies] = useState([]);
    const [tasteBasedMovies] = useState([]); // For future use

    // Separate loading states for each section
    const [trendingLoading, setTrendingLoading] = useState(true);
    const [topRatedLoading, setTopRatedLoading] = useState(true);
    const [tasteBasedLoading] = useState(false); // For future use

    const [trendingError, setTrendingError] = useState(null);
    const [topRatedError, setTopRatedError] = useState(null);
    const [tasteBasedError] = useState(null); // For future use

    const mapMoviesWithWatchlistStatus = useCallback(
        (movies) => {
            console.log(
                "Recommended: Mapping movies with watchlist status. Watchlist has",
                watchlist.length,
                "movies"
            );
            return movies.map((movie) => {
                const isInWatchlist = watchlist.some((w) => {
                    // Try multiple ID matching strategies
                    const movieIds = [
                        movie.id,
                        movie.imdbId,
                        movie.imdbID,
                    ].filter(Boolean);
                    const watchlistIds = [w.id, w.imdbId, w.imdbID].filter(
                        Boolean
                    );

                    // Check if any IDs match
                    const hasIdMatch = movieIds.some((mId) =>
                        watchlistIds.some((wId) => String(mId) === String(wId))
                    );

                    // Fallback to title matching (case insensitive)
                    const hasTitleMatch =
                        movie.title &&
                        w.title &&
                        movie.title.toLowerCase().trim() ===
                            w.title.toLowerCase().trim();

                    return hasIdMatch || hasTitleMatch;
                });

                if (movie.title) {
                    console.log(
                        `Recommended - Movie "${movie.title}" isInWatchlist:`,
                        isInWatchlist,
                        "movieIds:",
                        [movie.id, movie.imdbId, movie.imdbID].filter(Boolean)
                    );
                }

                return {
                    ...movie,
                    isInWatchlist,
                };
            });
        },
        [watchlist]
    );

    // Fetch movies from TMDb
    useEffect(() => {
        const fetchTrendingMovies = async () => {
            try {
                setTrendingLoading(true);
                setTrendingError(null);
                const response = await chrome.runtime.sendMessage({
                    type: "GetTrendingMovies",
                });

                if (response.success && response.movies) {
                    console.log("Received trending movies:", response.movies);
                    setTrendingMovies(response.movies);
                } else {
                    console.error("Failed to load trending movies:", response);
                    setTrendingError("Failed to load trending movies");
                }
            } catch (error) {
                console.error("Error fetching trending movies:", error);
                setTrendingError("Error loading trending movies");
            } finally {
                setTrendingLoading(false);
            }
        };

        const fetchTopRatedMovies = async () => {
            try {
                setTopRatedLoading(true);
                setTopRatedError(null);
                const response = await chrome.runtime.sendMessage({
                    type: "GetTopRatedMovies",
                });

                if (response.success && response.movies) {
                    console.log("Received top-rated movies:", response.movies);
                    setTopRatedMovies(response.movies);
                } else {
                    console.error("Failed to load top-rated movies:", response);
                    setTopRatedError("Failed to load top-rated movies");
                }
            } catch (error) {
                console.error("Error fetching top-rated movies:", error);
                setTopRatedError("Error loading top-rated movies");
            } finally {
                setTopRatedLoading(false);
            }
        };

        // For future taste-based recommendations
        const fetchTasteBasedMovies = async () => {
            // This will be implemented when the AI recommendation feature is ready
            // For now, we'll keep it as "Coming Soon"
        };

        fetchTrendingMovies();
        fetchTopRatedMovies();
        fetchTasteBasedMovies();
    }, []);

    return (
        <div className="space-y-6 p-6 rounded-lg h-full overflow-y-auto">
            {/* AI Recommendations Header */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <Sparkles className="w-5 h-5 text-red-500" />
                    </div>
                    <h3 className="font-semibold text-stone-800">
                        AI Recommendations
                    </h3>
                </div>
                <p className="text-sm text-stone-600">
                    Personalized picks based on your movie preferences and
                    viewing history
                </p>
            </div>

            {/* Trending Now */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-stone-800">
                        Trending Now
                    </h4>
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium border border-orange-200">
                        Hot
                    </span>
                </div>

                {trendingLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                        <span className="ml-2 text-stone-600">
                            Loading trending movies...
                        </span>
                    </div>
                ) : trendingError ? (
                    <div className="text-center py-8 text-red-500">
                        {trendingError}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div
                            className="flex gap-3 pb-4"
                            style={{ minWidth: "max-content" }}
                        >
                            {mapMoviesWithWatchlistStatus(trendingMovies).map(
                                (movie) => (
                                    <div
                                        key={movie.title}
                                        className="w-40 flex-shrink-0"
                                    >
                                        <MovieCard
                                            movie={movie}
                                            onAddToWatchlist={onAddToWatchlist}
                                            onRemoveFromWatchlist={
                                                onRemoveFromWatchlist
                                            }
                                            onViewDetails={onViewMovieDetails}
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Top Rated Movies */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-yellow-100 rounded-lg">
                        <Award className="w-4 h-4 text-yellow-600" />
                    </div>
                    <h4 className="font-semibold text-stone-800">Top Rated</h4>
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium border border-yellow-200">
                        Critics' Choice
                    </span>
                </div>

                {topRatedLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
                        <span className="ml-2 text-stone-600">
                            Loading top-rated movies...
                        </span>
                    </div>
                ) : topRatedError ? (
                    <div className="text-center py-8 text-red-500">
                        {topRatedError}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div
                            className="flex gap-3 pb-4"
                            style={{ minWidth: "max-content" }}
                        >
                            {mapMoviesWithWatchlistStatus(topRatedMovies).map(
                                (movie) => (
                                    <div
                                        key={movie.title}
                                        className="w-40 flex-shrink-0"
                                    >
                                        <MovieCard
                                            movie={movie}
                                            onAddToWatchlist={onAddToWatchlist}
                                            onRemoveFromWatchlist={
                                                onRemoveFromWatchlist
                                            }
                                            onViewDetails={onViewMovieDetails}
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Based on Your Taste */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-red-100 rounded-lg">
                        <Sparkles className="w-4 h-4 text-red-500" />
                    </div>
                    <h4 className="font-semibold text-stone-800">
                        Based on Your Taste
                    </h4>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium border border-red-200 whitespace-nowrap">
                        Coming Soon
                    </span>
                </div>

                {tasteBasedLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                        <span className="ml-2 text-stone-600">
                            Analyzing your preferences...
                        </span>
                    </div>
                ) : tasteBasedError ? (
                    <div className="text-center py-8 text-red-500">
                        {tasteBasedError}
                    </div>
                ) : tasteBasedMovies.length > 0 ? (
                    <div className="overflow-x-auto">
                        <div
                            className="flex gap-3 pb-4"
                            style={{ minWidth: "max-content" }}
                        >
                            {mapMoviesWithWatchlistStatus(tasteBasedMovies).map(
                                (movie) => (
                                    <div
                                        key={movie.title}
                                        className="w-40 flex-shrink-0"
                                    >
                                        <MovieCard
                                            movie={movie}
                                            onAddToWatchlist={onAddToWatchlist}
                                            onRemoveFromWatchlist={
                                                onRemoveFromWatchlist
                                            }
                                            onViewDetails={onViewMovieDetails}
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-stone-500">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>
                            AI-powered recommendations based on your watchlist
                            and preferences
                        </p>
                    </div>
                )}
            </div>

            {/* Refresh Recommendations */}
            <div className="pt-2 pb-6 space-y-2">
                <button
                    onClick={async () => {
                        try {
                            // Reset all loading states
                            setTrendingLoading(true);
                            setTopRatedLoading(true);
                            setTrendingError(null);
                            setTopRatedError(null);

                            await chrome.runtime.sendMessage({
                                type: "ClearCache",
                            });
                            // Force refresh by reloading the component
                            window.location.reload();
                        } catch (error) {
                            console.error("Error clearing cache:", error);
                        }
                    }}
                    className="w-full h-10 border-2 border-stone-200 rounded-md hover:border-red-500 hover:text-red-500 transition-colors flex items-center justify-center text-sm cursor-pointer"
                >
                    <Clock className="w-4 h-4 mr-2" />
                    Refresh Recommendations
                </button>
                <button
                    onClick={async () => {
                        try {
                            // Reset all loading states
                            setTrendingLoading(true);
                            setTopRatedLoading(true);
                            setTrendingError(null);
                            setTopRatedError(null);

                            await chrome.runtime.sendMessage({
                                type: "ClearCache",
                            });
                            alert("Cache cleared! Refreshing...");
                            window.location.reload();
                        } catch (error) {
                            console.error("Error clearing cache:", error);
                        }
                    }}
                    className="w-full h-8 border border-stone-300 rounded-md hover:border-orange-500 hover:text-orange-500 transition-colors flex items-center justify-center text-xs cursor-pointer"
                >
                    Clear Cache & Refresh
                </button>
            </div>
        </div>
    );
}

export default RecommendedComponent;
