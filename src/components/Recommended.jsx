import React from "react";
import { Sparkles, TrendingUp, Award, Clock } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { getMoviesByCategory } from "../data/movies";

function RecommendedComponent({
    onAddToWatchlist,
    onRemoveFromWatchlist,
    watchlist = [],
    onViewMovieDetails,
}) {
    const mapMoviesWithWatchlistStatus = (movies) =>
        movies.map((movie) => ({
            ...movie,
            isInWatchlist: watchlist.some((w) => w.id === movie.id),
        }));

    // Get movies from centralized data
    const trendingMovies = getMoviesByCategory("trending");
    const awardWinners = getMoviesByCategory("awardWinners");
    const basedOnYourTaste = getMoviesByCategory("basedOnYourTaste");

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

                <div className="grid grid-cols-2 gap-3">
                    {mapMoviesWithWatchlistStatus(trendingMovies).map(
                        (movie) => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                onAddToWatchlist={onAddToWatchlist}
                                onRemoveFromWatchlist={onRemoveFromWatchlist}
                                onViewDetails={onViewMovieDetails}
                            />
                        )
                    )}
                </div>
            </div>

            {/* Award Winners */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-yellow-100 rounded-lg">
                        <Award className="w-4 h-4 text-yellow-600" />
                    </div>
                    <h4 className="font-semibold text-stone-800">
                        Award Winners
                    </h4>
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium border border-yellow-200">
                        Critics' Choice
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {mapMoviesWithWatchlistStatus(awardWinners).map((movie) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            onAddToWatchlist={onAddToWatchlist}
                            onRemoveFromWatchlist={onRemoveFromWatchlist}
                            onViewDetails={onViewMovieDetails}
                        />
                    ))}
                </div>
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
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium border border-red-200">
                        For You
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {mapMoviesWithWatchlistStatus(basedOnYourTaste).map(
                        (movie) => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                onAddToWatchlist={onAddToWatchlist}
                                onRemoveFromWatchlist={onRemoveFromWatchlist}
                                onViewDetails={onViewMovieDetails}
                            />
                        )
                    )}
                </div>
            </div>

            {/* Refresh Recommendations */}
            <div className="pt-2 pb-6">
                <button className="w-full h-10 border-2 border-stone-200 rounded-md hover:border-red-500 hover:text-red-500 transition-colors flex items-center justify-center text-sm cursor-pointer">
                    <Clock className="w-4 h-4 mr-2" />
                    Refresh Recommendations
                </button>
            </div>
        </div>
    );
}

export default RecommendedComponent;
