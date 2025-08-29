import { useState } from "react";
import { Film, Search, Heart, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/tabs";

export default function App() {
    const [watchlist, setWatchlist] = useState([
        {
            id: 2,
            title: "Inception",
            year: 2010,
            genre: "Sci-Fi",
            rating: 8.8,
            poster: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWElMjBtb3ZpZSUyMHRoZWF0ZXJ8ZW58MXx8fHwxNzU2NTAyMjY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        },
        {
            id: 5,
            title: "Pulp Fiction",
            year: 1994,
            genre: "Crime",
            rating: 8.9,
            poster: "https://images.unsplash.com/photo-1608170825938-a8ea0305d46c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvcGNvcm4lMjBjaW5lbWF8ZW58MXx8fHwxNzU2NTAyMjcxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        },
    ]);

    const handleAddToWatchlist = (movie) => {
        if (!watchlist.some((w) => w.id === movie.id)) {
            setWatchlist([...watchlist, movie]);
        }
    };

    const handleRemoveFromWatchlist = (movie) => {
        setWatchlist(watchlist.filter((w) => w.id !== movie.id));
    };

    return (
        <div className="w-[380px] h-[600px] bg-background border rounded-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-[#171717] text-white p-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg">
                        <Film className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-medium">CineMate</h1>
                        <p className="text-xs opacity-70">
                            Track, Analyze, and Discover Movies
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden"></div>
        </div>
    );
}
