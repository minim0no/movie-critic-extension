import React, { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Award, Clock, Loader2 } from "lucide-react";
import { MovieCard } from "./MovieCard";

function RecommendedComponent({
    onAddToWatchlist,
    onRemoveFromWatchlist,
    watchlist = [],
    onViewMovieDetails,
}) {
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [topRatedMovies, setTopRatedMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const mapMoviesWithWatchlistStatus = (movies) =>
        movies.map((movie) => ({
            ...movie,
            isInWatchlist: watchlist.some(
                (w) =>
                    w.title === movie.title ||
                    w.id === movie.id ||
                    (w.imdbID && movie.imdbID && w.imdbID === movie.imdbID)
            ),
        }));

    // Fetch trending movies from TMDb
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

        const fetchTopRatedMovies = async () => {
            try {
                const response = await chrome.runtime.sendMessage({
                    type: "GetTopRatedMovies",
                });

                if (response.success && response.movies) {
                    console.log("Received top-rated movies:", response.movies);
                    setTopRatedMovies(response.movies);
                } else {
                    console.error("Failed to load top-rated movies:", response);
                }
            } catch (error) {
                console.error("Error fetching top-rated movies:", error);
            }
        };

        fetchTrendingMovies();
        fetchTopRatedMovies();
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

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                        <span className="ml-2 text-stone-600">
                            Loading trending movies...
                        </span>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
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
            </div>

            {/* Coming Soon */}
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

                <div className="text-center py-8 text-stone-500">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>
                        AI-powered recommendations based on your watchlist and
                        preferences
                    </p>
                </div>
            </div>

            {/* Refresh Recommendations */}
            <div className="pt-2 pb-6 space-y-2">
                <button
                    onClick={async () => {
                        try {
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
