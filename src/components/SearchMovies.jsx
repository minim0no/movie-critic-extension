import Input from "./Input";
import { Search } from "lucide-react";

function SearchMovies() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="space-y-4 h-full p-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>
        </div>
    );
}

export default SearchMovies;
