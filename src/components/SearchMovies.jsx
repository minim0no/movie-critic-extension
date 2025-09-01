import { useEffect, useState, useMemo } from "react";
import React from "react";
import Input from "./Input";
import { Search } from "lucide-react";
import Sidebar from "./Sidebar";
import { MovieCard } from "./MovieCard";
import { getMoviesByCategory } from "../data/movies";

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

    // Get movies from centralized data
    const searchMovies = getMoviesByCategory("search");

    // Map movies with watchlist status
    const moviesWithWatchlistStatus = searchMovies.map((movie) => ({
        ...movie,
        isInWatchlist: watchlist.some((w) => w.id === movie.id),
    }));

    // Filter movies based on search query and filters
    const filteredMovies = useMemo(() => {
        return moviesWithWatchlistStatus.filter((movie) => {
            // Search query filter
            const matchesSearch =
                !searchQuery ||
                movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                movie.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                movie.language
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            // Checkbox filters
            const genreFilters = checkboxFilters.genre.options;
            const languageFilters = checkboxFilters.language.options;

            // Check if any genre filters are active
            const hasActiveGenreFilters =
                Object.values(genreFilters).some(Boolean);
            if (hasActiveGenreFilters) {
                const movieGenre = movie.genre.toLowerCase();
                const matchesGenre = Object.entries(genreFilters).some(
                    ([genre, isChecked]) =>
                        isChecked && movieGenre.includes(genre.toLowerCase())
                );
                if (!matchesGenre) return false;
            }

            // Check if any language filters are active
            const hasActiveLanguageFilters =
                Object.values(languageFilters).some(Boolean);
            if (hasActiveLanguageFilters) {
                const movieLanguage = movie.language.toLowerCase();
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
                    numberFilters.imdb.startVal || numberFilters.imdb.min;
                const maxRating =
                    numberFilters.imdb.endVal || numberFilters.imdb.max;
                if (movie.rating < minRating || movie.rating > maxRating)
                    return false;
            }

            // Year filter
            if (
                numberFilters.date.startVal !== "" ||
                numberFilters.date.endVal !== ""
            ) {
                const minYear =
                    numberFilters.date.startVal || numberFilters.date.min;
                const maxYear =
                    numberFilters.date.endVal || numberFilters.date.max;
                if (movie.year < minYear || movie.year > maxYear) return false;
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
                return sorted.sort((a, b) => b.rating - a.rating);
        }
    }, [filteredMovies, sortOption]);

    useEffect(() => {
        console.log(checkboxFilters, numberFilters);
    }, [checkboxFilters, numberFilters]);

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
                <span className=" text-base font-medium">
                    {searchQuery ? "Search Results" : "Trending"}
                </span>
                <span className="text-sm text-stone-500">
                    {sortedAndFilteredMovies.length} movies found
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-6">
                {sortedAndFilteredMovies.map((movie) => (
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
    );
}

export default SearchMovies;
