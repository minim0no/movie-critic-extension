import React, { useState, useEffect } from "react";
import {
    ArrowLeft,
    Star,
    Users,
    Trophy,
    Sparkles,
    Clock,
    Calendar,
    Film,
} from "lucide-react";

/* global chrome */

function MovieDetail({
    movie,
    onBack,
    onAddToWatchlist,
    onRemoveFromWatchlist,
    isInWatchlist,
}) {
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [aiCritique, setAiCritique] = useState(null);
    const [aiCritiqueLoading, setAiCritiqueLoading] = useState(false);
    const [aiCritiqueError, setAiCritiqueError] = useState(null);
    const [ratingLoading, setRatingLoading] = useState(false);

    // Load user rating for this movie - fast cached version
    useEffect(() => {
        const loadUserRating = async () => {
            if (!movie.imdbId && !movie.id) return;

            setRatingLoading(true);
            const movieId = movie.imdbId || movie.id;

            try {
                // Try to get cached rating first
                const cacheKey = `rating-cache-${movieId}`;
                const cached = await chrome.storage.local.get([cacheKey]);

                if (
                    cached[cacheKey] &&
                    Date.now() - cached[cacheKey].timestamp < 5 * 60 * 1000
                ) {
                    // 5 min cache
                    setUserRating(cached[cacheKey].rating);
                    setRatingLoading(false);
                    return;
                }

                // Get current user info
                const authResult = await chrome.storage.local.get([
                    "authToken",
                ]);
                if (authResult.authToken) {
                    const userResponse = await fetch(
                        "https://www.googleapis.com/oauth2/v2/userinfo",
                        {
                            headers: {
                                Authorization: `Bearer ${authResult.authToken}`,
                            },
                        }
                    );

                    if (userResponse.ok) {
                        const userInfo = await userResponse.json();

                        // Use new dedicated rating system
                        const response = await chrome.runtime.sendMessage({
                            type: "GET_MOVIE_RATING",
                            data: {
                                userEmail: userInfo.email,
                                movieId: movieId,
                            },
                        });

                        if (response.success) {
                            const rating = response.rating || 0;
                            setUserRating(rating);

                            // Cache the result
                            await chrome.storage.local.set({
                                [cacheKey]: {
                                    rating,
                                    timestamp: Date.now(),
                                },
                            });
                        }
                    }
                } else {
                    // Fallback to old system if not authenticated
                    const response = await chrome.runtime.sendMessage({
                        type: "GetUserRating",
                        movieTitle: movie.title,
                    });
                    if (response.success) {
                        setUserRating(response.rating || 0);
                    }
                }
            } catch (error) {
                console.error("Error loading user rating:", error);
                // Fallback to old system
                try {
                    const response = await chrome.runtime.sendMessage({
                        type: "GetUserRating",
                        movieTitle: movie.title,
                    });
                    if (response.success) {
                        setUserRating(response.rating || 0);
                    }
                } catch (fallbackError) {
                    console.error(
                        "Fallback rating load failed:",
                        fallbackError
                    );
                }
            } finally {
                setRatingLoading(false);
            }
        };

        loadUserRating();
    }, [movie.imdbId, movie.id, movie.title]);

    // Load AI critique for this movie
    useEffect(() => {
        const loadAiCritique = async () => {
            try {
                setAiCritiqueLoading(true);
                setAiCritiqueError(null);

                const response = await chrome.runtime.sendMessage({
                    movieName: movie.title,
                    type: "GetAICritique",
                });

                if (response.success && response.critique) {
                    setAiCritique(response.critique);
                } else {
                    setAiCritiqueError(
                        "Unable to generate AI critique at this time."
                    );
                }
            } catch (error) {
                console.error("Error loading AI critique:", error);
                setAiCritiqueError("Failed to load AI critique.");
            } finally {
                setAiCritiqueLoading(false);
            }
        };

        if (movie.title) {
            loadAiCritique();
        }
    }, [movie.title]);

    // Handle star click to set rating - fast version
    const handleStarClick = async (rating) => {
        if (!movie.imdbId && !movie.id) return;

        const movieId = movie.imdbId || movie.id;

        // Optimistic update
        setUserRating(rating);

        try {
            // Get current user info
            const authResult = await chrome.storage.local.get(["authToken"]);
            if (authResult.authToken) {
                const userResponse = await fetch(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    {
                        headers: {
                            Authorization: `Bearer ${authResult.authToken}`,
                        },
                    }
                );

                if (userResponse.ok) {
                    const userInfo = await userResponse.json();

                    // Use new dedicated rating system
                    const response = await chrome.runtime.sendMessage({
                        type: "RATE_MOVIE",
                        data: {
                            userEmail: userInfo.email,
                            movieId: movieId,
                            movieData: {
                                title: movie.title,
                                year: movie.year,
                                poster: movie.poster,
                            },
                            rating: rating,
                        },
                    });

                    if (response.success) {
                        // Update cache immediately
                        const cacheKey = `rating-cache-${movieId}`;
                        await chrome.storage.local.set({
                            [cacheKey]: {
                                rating,
                                timestamp: Date.now(),
                            },
                        });
                        console.log(`Rated ${movie.title}: ${rating}/5`);
                    } else {
                        // Revert optimistic update and try fallback
                        const fallbackResponse =
                            await chrome.runtime.sendMessage({
                                type: "SaveUserRating",
                                movieTitle: movie.title,
                                rating: rating,
                            });
                        if (!fallbackResponse.success) {
                            setUserRating(0); // Revert if both fail
                        }
                    }
                }
            } else {
                // Fallback to old system
                const response = await chrome.runtime.sendMessage({
                    type: "SaveUserRating",
                    movieTitle: movie.title,
                    rating: rating,
                });

                if (!response.success) {
                    setUserRating(0); // Revert optimistic update
                }
            }
        } catch (error) {
            console.error("Error saving rating:", error);
            // Try fallback before reverting
            try {
                const response = await chrome.runtime.sendMessage({
                    type: "SaveUserRating",
                    movieTitle: movie.title,
                    rating: rating,
                });
                if (!response.success) {
                    setUserRating(0);
                }
            } catch (fallbackError) {
                console.error("Fallback rating save failed:", fallbackError);
                setUserRating(0); // Revert optimistic update
            }
        }
    };

    // Handle clear rating
    const handleClearRating = async () => {
        await handleStarClick(0);
    };
    return (
        <div className="h-full overflow-y-auto bg-white">
            {/* Header with Back Button */}
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                <div className="flex items-center gap-3 p-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5 text-stone-600" />
                    </button>
                </div>
            </div>

            {/* Movie Hero Section */}
            <div className="relative">
                <div className="h-48 bg-gradient-to-b from-stone-800 to-stone-900 relative overflow-hidden">
                    <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {movie.title}
                        </h2>
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{movie.year}</span>
                            <span>•</span>
                            <Film className="w-4 h-4" />
                            <span>
                                {Array.isArray(movie.genre) &&
                                movie.genre.length > 0
                                    ? movie.genre.join(", ")
                                    : "Unknown"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
                {/* Basic Info and Add/Remove Button */}
                <div className="space-y-4">
                    {/* IMDb Rating */}
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">
                            {movie.rating ||
                                movie.imdbRating ||
                                movie.ratingValue ||
                                "N/A"}
                        </span>
                        <span className="text-gray-500 text-sm">IMDb</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">
                            {movie.imdbVotes && movie.imdbVotes !== "N/A"
                                ? `${movie.imdbVotes} votes`
                                : movie.votes && movie.votes !== "N/A"
                                ? `${movie.votes} votes`
                                : "No vote count available"}
                        </span>
                    </div>

                    {/* User Rating - Inline with other ratings */}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                                Your Rating
                            </span>
                            {ratingLoading ? (
                                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : userRating > 0 ? (
                                <span className="text-sm text-yellow-600 font-semibold">
                                    {userRating}/5
                                </span>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => handleStarClick(star)}
                                        onMouseEnter={() =>
                                            setHoverRating(star)
                                        }
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-0.5 hover:scale-105 transition-transform cursor-pointer"
                                    >
                                        <Star
                                            className={`w-5 h-5 transition-colors ${
                                                hoverRating > 0
                                                    ? star <= hoverRating
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300"
                                                    : star <= userRating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>

                            {userRating > 0 && (
                                <button
                                    onClick={handleClearRating}
                                    className="ml-2 text-xs text-gray-500 hover:text-red-500 underline cursor-pointer"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {userRating === 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                Rate this movie
                            </p>
                        )}
                    </div>

                    {/* Add/Remove Button */}
                    <button
                        onClick={() =>
                            isInWatchlist
                                ? onRemoveFromWatchlist(movie)
                                : onAddToWatchlist(movie)
                        }
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer ${
                            isInWatchlist
                                ? "bg-white text-red-500 hover:bg-red-500 hover:text-white border border-red-500"
                                : "bg-red-500 text-white hover:bg-white hover:text-red-500 border border-red-500"
                        }`}
                    >
                        {isInWatchlist
                            ? "Remove from Watchlist"
                            : "Add to Watchlist"}
                    </button>
                </div>

                {/* Plot */}
                <div>
                    <h3 className="font-semibold text-stone-800 mb-2">Plot</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {movie.plot}
                    </p>
                </div>

                {/* Cast */}
                <div>
                    <h3 className="font-semibold text-stone-800 mb-2 flex items-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="lucide lucide-spotlight-icon"
                        >
                            <path d="M15.295 19.562 16 22" stroke="#FBBF24" />
                            <path d="m17 16 3.758 2.098" stroke="#FBBF24" />
                            <path d="m19 12.5 3.026-.598" stroke="#FBBF24" />

                            <path
                                d="M7.61 6.3a3 3 0 0 0-3.92 1.3l-1.38 2.79a3 3 0 0 0 1.3 3.91l6.89 3.597a1 1 0 0 0 1.342-.447l3.106-6.211a1 1 0 0 0-.447-1.341z"
                                fill="#010057"
                                stroke="#010057"
                            />

                            <path d="M8 9V2" stroke="#010057" />
                        </svg>
                        Cast
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {movie.actors && typeof movie.actors === "string" ? (
                            movie.actors.split(", ").map((actor, index) => (
                                <span
                                    key={index}
                                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                                >
                                    {actor.trim()}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-500 text-sm">
                                Cast information not available
                            </span>
                        )}
                    </div>
                </div>

                {/* Awards */}
                {movie.awards && movie.awards !== "N/A" && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <h3 className="font-semibold text-stone-800">
                                Awards
                            </h3>
                        </div>
                        <div className="text-gray-600 text-sm">
                            {movie.awards}
                        </div>
                    </div>
                )}

                {/* AI Critique */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold text-stone-800">
                            AI Critique
                        </h3>
                    </div>

                    {aiCritiqueLoading && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Generating AI critique...</span>
                        </div>
                    )}

                    {aiCritiqueError && (
                        <p className="text-red-500 text-sm leading-relaxed">
                            {aiCritiqueError}
                        </p>
                    )}

                    {aiCritique && !aiCritiqueLoading && (
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {aiCritique}
                        </p>
                    )}

                    {!aiCritique && !aiCritiqueLoading && !aiCritiqueError && (
                        <p className="text-gray-500 text-sm leading-relaxed italic">
                            AI critique will appear here once generated...
                        </p>
                    )}
                </div>

                {/* Additional Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-stone-800 mb-3">
                        Quick Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Director</span>
                            <div className="font-medium">
                                {movie.director || "N/A"}
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500">Box Office</span>
                            <div className="font-medium">
                                {movie.boxOffice || "N/A"}
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500">Language</span>
                            <div className="font-medium">
                                {movie.language || "N/A"}
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500">Rated</span>
                            <div className="font-medium">
                                {movie.rated || "N/A"}
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500">Runtime</span>
                            <div className="font-medium">
                                {movie.runtime || "N/A"}
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500">Source</span>
                            <div className="font-medium">{movie.source}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MovieDetail;
