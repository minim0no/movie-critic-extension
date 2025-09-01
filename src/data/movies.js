// Centralized movie data for the entire app
export const allMovies = [
    // Movies from SearchMovies component
    {
        id: 1,
        title: "The Dark Knight",
        year: 2008,
        genre: "Action",
        rating: 9.0,
        poster: "https://images.unsplash.com/photo-1745564371387-7707cc41e958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGFjdGlvbnxlbnwxfHx8fDE3NTY0NzMyMDd8MA&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: false,
        boxOffice: "$1,084,435,345",
        language: "English",
        rated: "PG-13",
    },
    {
        id: 2,
        title: "Inception",
        year: 2010,
        genre: "Sci-Fi",
        rating: 8.8,
        poster: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWElMjBtb3ZpZSUyMHRoZWF0ZXJ8ZW58MXx8fHwxNzU2NTAyMjY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: true,
        boxOffice: "$880,720,286",
        language: "English",
        rated: "PG-13",
    },
    {
        id: 3,
        title: "Parasite",
        year: 2019,
        genre: "Thriller",
        rating: 8.6,
        poster: "https://images.unsplash.com/photo-1745564371387-7707cc41e958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGRyYW1hfGVufDF8fHx8MTc1NjQwMDg4MXww&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: false,
        boxOffice: "$492,336,969",
        language: "English",
        rated: "PG-13",
    },
    {
        id: 4,
        title: "The Godfather",
        year: 1972,
        genre: "Drama",
        rating: 9.2,
        poster: "https://images.unsplash.com/photo-1661343320593-127da7a9cc13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWxtJTIwcmVlbCUyMHZpbnRhZ2V8ZW58MXx8fHwxNzU2NTAyMjY4fDA&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: false,
        boxOffice: "$272,786,080",
        language: "English",
        rated: "PG-13",
    },
    {
        id: 5,
        title: "Pulp Fiction",
        year: 1994,
        genre: "Crime",
        rating: 8.9,
        poster: "https://images.unsplash.com/photo-1608170825938-a8ea0305d46c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvcGNvcm4lMjBjaW5lbWF8ZW58MXx8fHwxNzU2NTAyMjcxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: true,
        boxOffice: "$278,796,233",
        language: "English",
        rated: "PG-13",
    },
    {
        id: 6,
        title: "The Shining",
        year: 1980,
        genre: "Horror",
        rating: 8.4,
        poster: "https://images.unsplash.com/photo-1712456298333-5747a9506a5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3Jyb3IlMjBtb3ZpZSUyMHBvc3RlcnxlbnwxfHx8fDE3NTY0OTk3ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: false,
        boxOffice: "$218,637,682",
        language: "English",
        rated: "PG-13",
    },

    // Movies from Recommended component
    {
        id: 101,
        title: "Oppenheimer",
        year: 2023,
        genre: "Biography",
        rating: 8.5,
        poster: "https://images.unsplash.com/photo-1661343320593-127da7a9cc13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWxtJTIwcmVlbCUyMHZpbnRhZ2V8ZW58MXx8fHwxNzU2NTAyMjY4fDA&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: false,
        boxOffice: "$950,000,000",
        language: "English",
        rated: "R",
    },
    {
        id: 102,
        title: "Barbie",
        year: 2023,
        genre: "Comedy",
        rating: 7.2,
        poster: "https://images.unsplash.com/photo-1608170825938-a8ea0305d46c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvcGNvcm4lMjBjaW5lbWF8ZW58MXx8fHwxNzU2NTAyMjcxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: false,
        boxOffice: "$1,445,000,000",
        language: "English",
        rated: "PG-13",
    },
    {
        id: 201,
        title: "Everything Everywhere All at Once",
        year: 2022,
        genre: "Sci-Fi",
        rating: 8.1,
        poster: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWElMjBtb3ZpZSUyMHRoZWF0ZXJ8ZW58MXx8fHwxNzU2NTAyMjY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: false,
        boxOffice: "$143,000,000",
        language: "English",
        rated: "R",
    },
    {
        id: 202,
        title: "Top Gun: Maverick",
        year: 2022,
        genre: "Action",
        rating: 8.3,
        poster: "https://images.unsplash.com/photo-1745564371387-7707cc41e958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGFjdGlvbnxlbnwxfHx8fDE3NTY0NzMyMDd8MA&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: false,
        boxOffice: "$1,495,000,000",
        language: "English",
        rated: "PG-13",
    },
    {
        id: 301,
        title: "Dune",
        year: 2021,
        genre: "Sci-Fi",
        rating: 8.0,
        poster: "https://images.unsplash.com/photo-1712456298333-5747a9506a5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3Jyb3IlMjBtb3ZpZSUyMHBvc3RlcnxlbnwxfHx8fDE3NTY0OTk3ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: false,
        boxOffice: "$402,000,000",
        language: "English",
        rated: "PG-13",
    },
    {
        id: 302,
        title: "The Batman",
        year: 2022,
        genre: "Action",
        rating: 7.8,
        poster: "https://images.unsplash.com/photo-1745564371387-7707cc41e958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGRyYW1hfGVufDF8fHx8MTc1NjQwMDg4MXww&ixlib=rb-4.1.0&q=80&w=1080",
        isInWatchlist: false,
        boxOffice: "$770,000,000",
        language: "English",
        rated: "PG-13",
    },
];

// Helper function to get movies by category
export const getMoviesByCategory = (category) => {
    switch (category) {
        case "trending":
            return allMovies.filter((movie) =>
                [1, 101, 102].includes(movie.id)
            );
        case "awardWinners":
            return allMovies.filter((movie) => [201, 202].includes(movie.id));
        case "basedOnYourTaste":
            return allMovies.filter((movie) => [301, 302].includes(movie.id));
        case "search":
            return allMovies.filter((movie) =>
                [1, 2, 3, 4, 5, 6].includes(movie.id)
            );
        default:
            return allMovies;
    }
};

// Helper function to get a movie by ID
export const getMovieById = (id) => {
    return allMovies.find((movie) => movie.id === id);
};
