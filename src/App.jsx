import { useState, useEffect } from "react";
import { Search, Heart, Sparkles, LogOut } from "lucide-react";
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
    const { isAuthenticated, user, signOut, loading } = useAuth();

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
            <div className="bg-stone-800 text-white p-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <img
                                src="./icons/128x128.png"
                                className="w-12 h-12"
                            />
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
                    {isAuthenticated && user && (
                        <div className="flex items-center gap-2">
                            <div className="text-xs opacity-70">
                                Hi, {user.given_name || user.name}
                            </div>
                            <button
                                onClick={signOut}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                                title="Sign out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
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
                {view === "search" && (
                    <SearchMovies
                        onAddToWatchlist={handleAddToWatchlist}
                        onRemoveFromWatchlist={handleRemoveFromWatchlist}
                        watchlist={watchlist}
                        onViewMovieDetails={handleViewMovieDetails}
                    />
                )}
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
