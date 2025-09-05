import { Star, Plus, Check } from "lucide-react";
import { Badge } from "@radix-ui/themes";
import { useState } from "react";

export function MovieCard({
    movie,
    onAddToWatchlist,
    onRemoveFromWatchlist,
    showActions = true,
    onViewDetails,
}) {
    const [imgError, setImgError] = useState(false);

    const handleCardClick = (e) => {
        // Don't trigger if clicking on action buttons
        if (e.target.closest("button")) {
            return;
        }
        onViewDetails && onViewDetails(movie);
    };

    return (
        <div
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer relative"
            onClick={handleCardClick}
        >
            <div className="aspect-[2/3] relative overflow-hidden">
                <img
                    src={imgError ? "/fallback-poster.png" : movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={() => setImgError(true)}
                />
                <div className="absolute top-2 right-2 bg-black/90 px-2 py-1 rounded-md shadow-lg text-xs">
                    <Badge className="inline-flex items-center ">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                        <span className="text-white">
                            {movie.rating ||
                                movie.imdbRating ||
                                movie.ratingValue ||
                                "N/A"}
                        </span>
                    </Badge>
                </div>
            </div>

            <div className="p-3">
                <h3 className="font-medium line-clamp-2 mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                    {movie.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{movie.year}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-md whitespace-nowrap overflow-hidden text-ellipsis">
                        {Array.isArray(movie.genre) && movie.genre.length > 0
                            ? movie.genre[0]
                            : movie.genre || "Unknown"}
                    </span>
                </div>

                {showActions && (
                    <div className="flex gap-2">
                        {movie.isInWatchlist ? (
                            <button
                                className="flex-1 text-xs h-8 border border-red-500 text-red-500 rounded-md flex items-center justify-center hover:bg-red-500 hover:text-white cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFromWatchlist &&
                                        onRemoveFromWatchlist(movie);
                                }}
                            >
                                <Check className="w-3 h-3 mr-1" />
                                In List
                            </button>
                        ) : (
                            <button
                                className="flex-1 text-xs h-8 bg-red-500 text-white rounded-md flex items-center justify-center hover:bg-white hover:text-red-500 border border-red-500 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToWatchlist && onAddToWatchlist(movie);
                                }}
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                Add
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
