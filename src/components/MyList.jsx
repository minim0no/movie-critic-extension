import React, { useState, useEffect, useMemo } from "react";
import { Heart, Star, Trash2 } from "lucide-react";
import Sidebar from "./Sidebar";
import { MovieCard } from "./MovieCard";

function MyList({ watchlist = [], onRemoveFromWatchlist, onViewMovieDetails }) {
    const [sortOption, setSortOption] = useState("rating");
    const [filteredWatchlist, setFilteredWatchlist] = useState(watchlist);
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

    // Filter and sort watchlist
    const filteredAndSortedWatchlist = useMemo(() => {
        let filtered = [...watchlist];

        // Apply checkbox filters
        Object.entries(checkboxFilters).forEach(([sectionId, section]) => {
            const activeFilters = Object.entries(section.options)
                .filter(([, checked]) => checked)
                .map(([option]) => option);

            if (activeFilters.length > 0) {
                if (sectionId === "genre") {
                    filtered = filtered.filter((movie) => {
                        if (!movie.genre) return false;

                        let movieGenres = [];
                        if (Array.isArray(movie.genre)) {
                            movieGenres = movie.genre.map((g) =>
                                g.toLowerCase()
                            );
                        } else if (typeof movie.genre === "string") {
                            movieGenres = [movie.genre.toLowerCase()];
                        }

                        return activeFilters.some((genre) =>
                            movieGenres.some((movieGenre) =>
                                movieGenre.includes(genre.toLowerCase())
                            )
                        );
                    });
                } else if (sectionId === "language") {
                    filtered = filtered.filter((movie) =>
                        activeFilters.some((language) =>
                            movie.language
                                ?.toLowerCase()
                                .includes(language.toLowerCase())
                        )
                    );
                }
            }
        });

        // Apply number filters
        Object.entries(numberFilters).forEach(([sectionId, section]) => {
            if (section.startVal !== "" || section.endVal !== "") {
                if (sectionId === "imdb") {
                    const minRating =
                        parseFloat(section.startVal) || section.min;
                    const maxRating = parseFloat(section.endVal) || section.max;
                    filtered = filtered.filter((movie) => {
                        const movieRating = parseFloat(movie.ratingValue) || 0;
                        return (
                            movieRating >= minRating && movieRating <= maxRating
                        );
                    });
                } else if (sectionId === "date") {
                    const minYear = parseInt(section.startVal) || section.min;
                    const maxYear = parseInt(section.endVal) || section.max;
                    filtered = filtered.filter((movie) => {
                        const movieYear = parseInt(movie.year) || 0;
                        return movieYear >= minYear && movieYear <= maxYear;
                    });
                }
            }
        });

        // Sort filtered movies
        switch (sortOption) {
            case "newest":
                return filtered.sort((a, b) => b.year - a.year);
            case "oldest":
                return filtered.sort((a, b) => a.year - b.year);
            case "title-asc":
                return filtered.sort((a, b) => a.title.localeCompare(b.title));
            case "title-desc":
                return filtered.sort((a, b) => b.title.localeCompare(a.title));
            case "rating":
            default:
                return filtered.sort(
                    (a, b) => (b.ratingValue || 0) - (a.ratingValue || 0)
                );
        }
    }, [watchlist, checkboxFilters, numberFilters, sortOption]);

    // Update filtered watchlist when watchlist or filters change
    useEffect(() => {
        setFilteredWatchlist(filteredAndSortedWatchlist);
    }, [filteredAndSortedWatchlist]);

    // Debug logging
    useEffect(() => {
        console.log("MyList - Filters changed:", {
            checkboxFilters,
            numberFilters,
        });
        console.log("MyList - Watchlist length:", watchlist.length);
        console.log("MyList - Filtered length:", filteredWatchlist.length);
        console.log("MyList - Sort option:", sortOption);
    }, [
        checkboxFilters,
        numberFilters,
        watchlist.length,
        filteredWatchlist.length,
        sortOption,
    ]);

    const totalRuntime = filteredWatchlist.length * 120; // Assuming 120 min average
    const averageRating =
        filteredWatchlist.length > 0
            ? filteredWatchlist.reduce(
                  (sum, movie) => sum + (movie.ratingValue || 0),
                  0
              ) / filteredWatchlist.length
            : 0;

    return (
        <div className="space-y-6 p-6 rounded-lg h-full overflow-y-auto">
            {/* Stats Header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold">My Collection</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <div className="text-xl font-semibold text-red-500">
                            {filteredWatchlist.length}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Movies</div>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <div className="text-xl font-semibold">
                            {Math.round(totalRuntime / 60)}h
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Runtime
                        </div>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <div className="text-xl font-semibold flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {averageRating.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Avg Rating
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Sidebar
                checkboxFilters={checkboxFilters}
                numberFilters={numberFilters}
                setCheckboxFilters={setCheckboxFilters}
                setNumberFilters={setNumberFilters}
                sortOption={sortOption}
                setSortOption={setSortOption}
            />

            {/* Watchlist */}
            {filteredWatchlist.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Heart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold mb-2">No movies found</h3>
                    <p className="text-sm text-gray-500 mb-4 px-4">
                        {watchlist.length === 0
                            ? "Start building your collection by adding movies from the search tab"
                            : "Try adjusting your filters to see more movies"}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">My Watchlist</h3>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium border border-red-200">
                            {filteredWatchlist.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-6">
                        {filteredWatchlist.map((movie) => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                onRemoveFromWatchlist={onRemoveFromWatchlist}
                                showActions={true}
                                onViewDetails={onViewMovieDetails}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyList;
