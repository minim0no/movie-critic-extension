import { useState } from "react";
import React from "react";
import Input from "./Input";
import { Search, Filter } from "lucide-react";
import { Theme, Button } from "@radix-ui/themes";
import Select from "./Select";
import Range from "./Range";

const genres = [
    "All Genres",
    "Action",
    "Adventure",
    "Animation",
    "Biography",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "Film-Noir",
    "History",
    "Horror",
    "Music",
    "Musical",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Sport",
    "Thriller",
    "War",
    "Western",
];

const languages = [
    "All Languages",
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Korean",
    "Hindi",
    "Arabic",
    "Portuguese",
    "Russian",
];
function SearchMovies() {
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState("All Genres");
    const [selectedLanguage, setSelectedLanguage] = useState("All Languages");
    const [imdbRating, setImdbRating] = useState([]);
    const [rottenTomatoes, setRottenTomatoes] = useState([]);
    const [yearRange, setYearRange] = useState([]);
    const [openSlider, setOpenSlider] = useState(null);

    return (
        <div className="space-y-6 h-full p-6 rounded-lg shadow-md">
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

            <Theme>
                <div className="flex flex-col items-start gap-4">
                    <Button
                        variant="outline"
                        className="!text-gray-700 outline-none !border-gray-100 hover:!border-gray-400 hover:!bg-gray-100"
                        size={"2"}
                        color="gray"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </Button>
                    {showFilters && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <Select
                                items={genres}
                                placeholder="All Genres"
                                value={selectedGenre}
                                setValue={setSelectedGenre}
                            />
                            <Select
                                items={languages}
                                placeholder="All Languages"
                                value={selectedLanguage}
                                setValue={setSelectedLanguage}
                            />
                            <Range
                                text={`Year Range`}
                                min={1900}
                                max={new Date().getFullYear()}
                                rangeValue={yearRange}
                                setRangeValue={setYearRange}
                                open={openSlider === "year"}
                                setOpen={() =>
                                    setOpenSlider(
                                        openSlider === "year" ? null : "year"
                                    )
                                }
                            />
                            <Range
                                min={0}
                                max={10}
                                text={`IMDb Rating`}
                                rangeValue={imdbRating}
                                setRangeValue={setImdbRating}
                                open={openSlider === "imdb"}
                                setOpen={() =>
                                    setOpenSlider(
                                        openSlider === "imdb" ? null : "imdb"
                                    )
                                }
                            />
                            <Range
                                min={0}
                                max={100}
                                text={`Rotten Tomatoes`}
                                rangeValue={rottenTomatoes}
                                setRangeValue={setRottenTomatoes}
                                open={openSlider === "rotten"}
                                setOpen={() =>
                                    setOpenSlider(
                                        openSlider === "rotten"
                                            ? null
                                            : "rotten"
                                    )
                                }
                            />
                        </div>
                    )}
                </div>
            </Theme>
        </div>
    );
}

export default SearchMovies;
