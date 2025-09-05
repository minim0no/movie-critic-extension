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

    // Load user watchlist when authenticated
    useEffect(() => {
        const loadWatchlist = async () => {
            if (isAuthenticated && user?.email) {
                try {
                    const response = await chrome.runtime.sendMessage({
                        type: "GET_USER_WATCHLIST",
                        data: { userEmail: user.email },
                    });

                    if (response.success) {
                        // Ensure all watchlist movies have isInWatchlist: true
                        const watchlistWithStatus = response.watchlist.map(
                            (movie) => ({
                                ...movie,
                                isInWatchlist: true,
                            })
                        );
                        setWatchlist(watchlistWithStatus);
                    }
                } catch (error) {
                    console.error("Error loading watchlist:", error);
                }
            } else {
                setWatchlist([]); // Clear watchlist when not authenticated
            }
        };

        loadWatchlist();
    }, [isAuthenticated, user]);

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

    const handleAddToWatchlist = async (movie) => {
        if (!isAuthenticated) {
            setView("myList"); // Redirect to MyList to show login
            return;
        }

        // Optimistic update - immediately add to UI
        const movieData = {
            title: movie.title || movie.Title,
            year: movie.year || movie.Year,
            imdbId: movie.imdbId || movie.imdbID || movie.id,
            plot: movie.plot || movie.Plot || movie.overview,
            genre: movie.genre || movie.Genre,
            poster: movie.poster || movie.Poster,
            director: movie.director || movie.Director,
            actors: movie.actors || movie.Actors,
            // Keep both rating formats for compatibility (OMDB uses imdbRating)
            rating: movie.rating || movie.imdbRating,
            imdbRating: movie.imdbRating || movie.rating,
            ratingValue: movie.ratingValue || movie.imdbRating || movie.rating,
            imdbVotes: movie.imdbVotes || movie.votes,
            language: movie.language || movie.Language,
            // Additional OMDB fields (with correct capitalization)
            runtime: movie.runtime || movie.Runtime,
            boxOffice: movie.boxOffice || movie.BoxOffice,
            rated: movie.rated || movie.Rated,
            writer: movie.writer || movie.Writer,
            awards: movie.awards || movie.Awards,
            metascore: movie.metascore || movie.Metascore,
            type: movie.type || movie.Type,
            dvd: movie.dvd || movie.DVD,
            production: movie.production || movie.Production,
            website: movie.website || movie.Website,
            // Additional useful fields
            country: movie.country || movie.Country,
            released: movie.released || movie.Released,
            isInWatchlist: true,
        };

        // Check if already exists before doing anything
        const isAlreadyInWatchlist = watchlist.some(
            (w) =>
                w.id === movie.id ||
                w.imdbId === movie.imdbId ||
                w.imdbId === movieData.imdbId
        );

        if (isAlreadyInWatchlist) {
            console.log("Movie already in watchlist, skipping");
            return;
        }

        // Immediately update UI
        console.log("Optimistically adding movie to watchlist:", movieData);
        setWatchlist((prev) => [...prev, movieData]);

        // Save to database
        try {
            const response = await chrome.runtime.sendMessage({
                type: "ADD_MOVIE_TO_LIST",
                data: {
                    userEmail: user.email,
                    listId: "watchlist",
                    movieData: movieData,
                },
            });

            if (response.success) {
                console.log("Successfully saved movie to database");
            } else {
                // Revert optimistic update if database save failed
                console.log(
                    "Database save failed, reverting optimistic update"
                );
                setWatchlist((prev) =>
                    prev.filter((w) => w.imdbId !== movieData.imdbId)
                );
            }
        } catch (error) {
            console.error("Error adding to watchlist:", error);
            // Revert optimistic update on error
            setWatchlist((prev) =>
                prev.filter((w) => w.imdbId !== movieData.imdbId)
            );
        }
    };

    const handleRemoveFromWatchlist = async (movie) => {
        // Optimistic update - immediately remove from UI
        console.log(
            `Optimistically removing movie "${movie.title}" from watchlist`
        );
        const originalWatchlist = [...watchlist];

        setWatchlist((prev) =>
            prev.filter((w) => {
                // Try multiple ID matching strategies
                const movieIds = [movie.id, movie.imdbId, movie.imdbID].filter(
                    Boolean
                );
                const watchlistIds = [w.id, w.imdbId, w.imdbID].filter(Boolean);

                // Check if any IDs match
                const hasIdMatch = movieIds.some((mId) =>
                    watchlistIds.some((wId) => String(mId) === String(wId))
                );

                // Fallback to title matching (case insensitive)
                const hasTitleMatch =
                    movie.title &&
                    w.title &&
                    movie.title.toLowerCase().trim() ===
                        w.title.toLowerCase().trim();

                // Keep movies that DON'T match (inverse of the matching logic)
                return !(hasIdMatch || hasTitleMatch);
            })
        );

        // Then save to database
        try {
            const response = await chrome.runtime.sendMessage({
                type: "REMOVE_FROM_WATCHLIST",
                data: {
                    userEmail: user.email,
                    movieId: movie.imdbId || movie.id,
                },
            });

            if (response.success) {
                console.log(
                    `Successfully removed movie "${movie.title}" from database`
                );
            } else {
                // Revert optimistic update if database removal failed
                console.log(
                    "Database removal failed, reverting optimistic update"
                );
                setWatchlist(originalWatchlist);
            }
        } catch (error) {
            console.error("Error removing from watchlist:", error);
            // Revert optimistic update on error
            setWatchlist(originalWatchlist);
        }
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
        return watchlist.some((w) => {
            // Try multiple ID matching strategies
            const movieIds = [movie.id, movie.imdbId, movie.imdbID].filter(
                Boolean
            );
            const watchlistIds = [w.id, w.imdbId, w.imdbID].filter(Boolean);

            // Check if any IDs match
            const hasIdMatch = movieIds.some((mId) =>
                watchlistIds.some((wId) => String(mId) === String(wId))
            );

            // Fallback to title matching (case insensitive)
            const hasTitleMatch =
                movie.title &&
                w.title &&
                movie.title.toLowerCase().trim() ===
                    w.title.toLowerCase().trim();

            return hasIdMatch || hasTitleMatch;
        });
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
                        key={selectedMovie.imdbId || selectedMovie.id}
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
