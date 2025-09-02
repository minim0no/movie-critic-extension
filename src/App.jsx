import { useState, useEffect } from "react";
import { Search, Heart, Sparkles, Coffee } from "lucide-react";
import NavButton from "./components/NavButton";
import SearchMovies from "./components/SearchMovies";
import MyList from "./components/MyList";
import RecommendedComponent from "./components/Recommended";
import MovieDetail from "./components/MovieDetail";
import Login from "./components/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function AppContent() {
    const [view, setView] = useState("search");
    const [watchlist, setWatchlist] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [previousView, setPreviousView] = useState("search");
    const { isAuthenticated, user, loading } = useAuth();

    // Check for requested view from background script
    useEffect(() => {
        chrome.storage.local.get(["requestedView"], (result) => {
            if (result.requestedView) {
                setView(result.requestedView);
                // Clear the requested view
                chrome.storage.local.remove(["requestedView"]);
            }
        });
    }, []);

    const handleAddToWatchlist = (movie) => {
        if (!isAuthenticated) {
            setView("myList"); // Redirect to MyList to show login
            return;
        }

        if (!watchlist.some((w) => w.id === movie.id)) {
            setWatchlist((prev) => [
                ...prev,
                { ...movie, isInWatchlist: true },
            ]);
        }
    };

    const handleRemoveFromWatchlist = (movie) => {
        setWatchlist((prev) => prev.filter((w) => w.id !== movie.id));
    };

    const handleViewMovieDetails = (movie) => {
        setPreviousView(view);
        setSelectedMovie(movie);
        setView("movieDetail");
    };

    const handleBackFromMovieDetail = () => {
        setView(previousView);
        setSelectedMovie(null);
    };

    const isMovieInWatchlist = (movie) => {
        return watchlist.some((w) => w.id === movie.id);
    };

    // Show loading state
    if (loading) {
        return (
            <div className="w-[380px] h-[600px] bg-white border border-stone-800 overflow-hidden flex flex-col">
                <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-[380px] h-[600px] bg-white border border-stone-800 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-stone-800 text-white p-3 border-b">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg flex-shrink-0">
                            <img
                                src="./icons/128x128.png"
                                className="w-11 h-11"
                            />
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-medium text-sm">
                                <span className="text-red-500">Cine</span>Mate
                            </h1>
                            <p className="text-xs opacity-70">
                                Discover, Track, and Curate Your Favorites!
                            </p>
                        </div>
                    </div>
                    {isAuthenticated && user && (
                        <a
                            href="https://buymeacoffee.com/ahmedidrees"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-amber-900 rounded transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 font-medium text-xs"
                            title="Buy me a coffee"
                        >
                            <Coffee className="w-3.5 h-3.5" />
                            <span>Buy me a coffee</span>
                        </a>
                    )}
                </div>
            </div>

            {/* Navigation - Only show when not in movie detail view */}
            {view !== "movieDetail" && (
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
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {view === "search" &&
                    (isAuthenticated ? (
                        <SearchMovies
                            onAddToWatchlist={handleAddToWatchlist}
                            onRemoveFromWatchlist={handleRemoveFromWatchlist}
                            watchlist={watchlist}
                            onViewMovieDetails={handleViewMovieDetails}
                        />
                    ) : (
                        <Login onLoginSuccess={() => setView("search")} />
                    ))}
                {view === "myList" &&
                    (isAuthenticated ? (
                        <MyList
                            watchlist={watchlist}
                            onRemoveFromWatchlist={handleRemoveFromWatchlist}
                            onViewMovieDetails={handleViewMovieDetails}
                        />
                    ) : (
                        <Login onLoginSuccess={() => setView("myList")} />
                    ))}
                {view === "recommended" &&
                    (isAuthenticated ? (
                        <RecommendedComponent
                            onAddToWatchlist={handleAddToWatchlist}
                            onRemoveFromWatchlist={handleRemoveFromWatchlist}
                            watchlist={watchlist}
                            onViewMovieDetails={handleViewMovieDetails}
                        />
                    ) : (
                        <Login onLoginSuccess={() => setView("recommended")} />
                    ))}
                {view === "movieDetail" && selectedMovie && (
                    <MovieDetail
                        movie={selectedMovie}
                        onBack={handleBackFromMovieDetail}
                        onAddToWatchlist={handleAddToWatchlist}
                        onRemoveFromWatchlist={handleRemoveFromWatchlist}
                        isInWatchlist={isMovieInWatchlist(selectedMovie)}
                    />
                )}
            </div>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
