import { useState } from "react";
import React from "react";
import Input from "./Input";
import { Search, Filter } from "lucide-react";
import { Theme, Button } from "@radix-ui/themes";
import Select from "./Select";

function SearchMovies() {
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState("All Genres");

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
                <div className="flex items-center gap-4">
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
                        <Select
                            items={[
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
                            ]}
                            placeholder="All Genres"
                            value={selectedGenre}
                            setValue={setSelectedGenre}
                        />
                    )}
                </div>
            </Theme>
        </div>
    );
}

export default SearchMovies;
