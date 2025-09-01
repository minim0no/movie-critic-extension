import { useEffect, useState } from "react";
import React from "react";
import Input from "./Input";
import { Search } from "lucide-react";
import Sidebar from "./Sidebar";
import { MovieCard } from "./MovieCard";

const mockMovie = [
    {
        id: 1,
        title: "The Dark Knight",
        year: 2008,
        genre: "Action",
        rating: 9.0,
        poster: "https://images.unsplash.com/photo-1745564371387-7707cc41e958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGFjdGlvbnxlbnwxfHx8fDE3NTY0NzMyMDd8MA&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: false,
    },
    {
        id: 2,
        title: "Inception",
        year: 2010,
        genre: "Sci-Fi",
        rating: 8.8,
        poster: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWElMjBtb3ZpZSUyMHRoZWF0ZXJ8ZW58MXx8fHwxNzU2NTAyMjY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: true,
    },
    {
        id: 3,
        title: "Parasite",
        year: 2019,
        genre: "Thriller",
        rating: 8.6,
        poster: "https://images.unsplash.com/photo-1745564371387-7707cc41e958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGRyYW1hfGVufDF8fHx8MTc1NjQwMDg4MXww&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: false,
    },
    {
        id: 4,
        title: "The Godfather",
        year: 1972,
        genre: "Drama",
        rating: 9.2,
        poster: "https://images.unsplash.com/photo-1661343320593-127da7a9cc13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWxtJTIwcmVlbCUyMHZpbnRhZ2V8ZW58MXx8fHwxNzU2NTAyMjY4fDA&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: false,
    },
    {
        id: 5,
        title: "Pulp Fiction",
        year: 1994,
        genre: "Crime",
        rating: 8.9,
        poster: "https://images.unsplash.com/photo-1608170825938-a8ea0305d46c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvcGNvcm4lMjBjaW5lbWF8ZW58MXx8fHwxNzU2NTAyMjcxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: true,
    },
    {
        id: 6,
        title: "The Shining",
        year: 1980,
        genre: "Horror",
        rating: 8.4,
        poster: "https://images.unsplash.com/photo-1712456298333-5747a9506a5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3Jyb3IlMjBtb3ZpZSUyMHBvc3RlcnxlbnwxfHx8fDE3NTY0OTk3ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: false,
    },
];

function SearchMovies() {
    const [searchQuery, setSearchQuery] = useState("");
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

    useEffect(() => {
        console.log(checkboxFilters, numberFilters);
    }, [checkboxFilters, numberFilters]);

    return (
        <div className="space-y-6 p-6 rounded-lg h-[600px] overflow-y-auto">
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
            />

            <div className="flex items-center justify-between mb-3">
                <span className=" text-base font-medium">
                    {searchQuery ? "Search Results" : "Trending"}
                </span>
                <span className="text-sm text-stone-500">
                    {mockMovie.length} movies found
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-36">
                {mockMovie.map((movie) => (
                    <MovieCard
                        key={movie.id}
                        movie={movie}
                        onAddToWatchlist={() => {}}
                        onRemoveFromWatchlist={() => {}}
                    />
                ))}
            </div>
        </div>
    );
}

export default SearchMovies;
