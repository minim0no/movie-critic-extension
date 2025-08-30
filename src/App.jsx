import { useState } from "react";
import { Search, Heart, Sparkles } from "lucide-react";
import NavButton from "./components/NavButton";
import SearchMovies from "./components/SearchMovies";

export default function App() {
    const [view, setView] = useState("search");

    return (
        <div className="w-[380px] h-[600px] bg-white border border-stone-800 rounded-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-stone-800 text-white p-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg">
                        <img src="./icons/128x128.png" className="w-12 h-12" />
                    </div>
                    <div>
                        <h1 className="font-medium">
                            <span className="text-red-500">Cine</span>Mate
                        </h1>
                        <p className="text-xs opacity-70">
                            Track, Analyze, and Discover Movies
                        </p>
                    </div>
                </div>
            </div>
            {/* Navigation */}
            <div className="w-full flex items-center justify-around border-b border-slate-200 py-2 px-6">
                <NavButton
                    icon={<Search className="w-4 h-4" />}
                    label="Search"
                    focus={view === "search"}
                    onClick={() => setView("search")}
                />
                <NavButton
                    icon={<Heart className="w-4 h-4" />}
                    label="My List"
                    focus={view === "myList"}
                    onClick={() => setView("myList")}
                />
                <NavButton
                    icon={<Sparkles className="w-4 h-4" />}
                    label="Recommended"
                    focus={view === "recommended"}
                    onClick={() => setView("recommended")}
                />
            </div>

            {/* Main Content */}
            <div>
                {view === "search" && <SearchMovies />}
                {view === "myList" && <div />}
                {view === "recommended" && <div />}
            </div>
        </div>
    );
}
