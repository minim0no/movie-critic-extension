import React from "react";
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

function MovieDetail({
    movie,
    onBack,
    onAddToWatchlist,
    onRemoveFromWatchlist,
    isInWatchlist,
}) {
    // Mock additional data for demonstration
    const movieData = {
        ...movie,
        runtime: "2h 32m",
        director: "Christopher Nolan",
        actors: [
            "Cillian Murphy",
            "Emily Blunt",
            "Matt Damon",
            "Robert Downey Jr.",
        ],
        awards: [
            "Best Picture - Academy Awards",
            "Best Director - Golden Globes",
        ],
        aiCritique:
            "A masterful exploration of scientific discovery and moral responsibility. Nolan's direction creates an intense, thought-provoking experience that balances historical accuracy with compelling storytelling. The film's visual effects and sound design are groundbreaking, making it a cinematic achievement that will be studied for years to come.",
        imdbVotes: "789,432",
        rottenTomatoesScore: "93%",
        plot: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
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
                            <Clock className="w-4 h-4" />
                            <span>{movieData.runtime}</span>
                            <span>•</span>
                            <Film className="w-4 h-4" />
                            <span>{movie.genre}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
                {/* Basic Info and Add/Remove Button */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{movie.rating}</span>
                        <span className="text-gray-500 text-sm">IMDb</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">
                            {movieData.imdbVotes} votes
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">🍅</span>
                        <span className="font-semibold">
                            {movieData.rottenTomatoesScore}
                        </span>
                        <span className="text-gray-500 text-sm">
                            Rotten Tomatoes
                        </span>
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
                        {movieData.plot}
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
                        {movieData.actors.map((actor, index) => (
                            <span
                                key={index}
                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                            >
                                {actor}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Awards */}
                {movieData.awards.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <h3 className="font-semibold text-stone-800">
                                Awards
                            </h3>
                        </div>
                        <div className="space-y-1">
                            {movieData.awards.map((award, index) => (
                                <div
                                    key={index}
                                    className="text-gray-600 text-sm"
                                >
                                    {award}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Critique */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold text-stone-800">
                            AI Critique
                        </h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {movieData.aiCritique}
                    </p>
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
                                {movieData.director}
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500">Box Office</span>
                            <div className="font-medium">{movie.boxOffice}</div>
                        </div>
                        <div>
                            <span className="text-gray-500">Language</span>
                            <div className="font-medium">{movie.language}</div>
                        </div>
                        <div>
                            <span className="text-gray-500">Rated</span>
                            <div className="font-medium">{movieData.rated}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MovieDetail;
