import { useEffect, useState } from "react";
import React from "react";
import Input from "./Input";
import { Search } from "lucide-react";
import Sidebar from "./Sidebar";

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
        <div className="space-y-6 h-full p-6 rounded-lg">
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
        </div>
    );
}

export default SearchMovies;
