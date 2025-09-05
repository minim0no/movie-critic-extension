/* global chrome */

let currentUserEmail = null;

// Get current user email from authentication
async function getCurrentUserEmail() {
    if (currentUserEmail) return currentUserEmail;

    try {
        // Get auth token from storage
        const result = await chrome.storage.local.get(["authToken"]);
        const authToken = result.authToken;

        if (!authToken) {
            console.log("❌ No auth token found in storage");
            return null;
        }

        console.log(
            "✅ Found auth token, fetching user info from Google API..."
        );

        // Get user info from Google API (same as auth service does)
        const response = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        if (!response.ok) {
            console.log(
                "❌ Failed to fetch user info from Google API:",
                response.status
            );
            if (response.status === 401) {
                console.log("❌ Auth token is invalid or expired");
            }
            return null;
        }

        const userInfo = await response.json();
        console.log("✅ Got user info from Google API:", userInfo);

        if (userInfo.email) {
            currentUserEmail = userInfo.email;
            console.log("✅ Found user email:", currentUserEmail);
            return currentUserEmail;
        }

        console.log("❌ No email in user info");
    } catch (error) {
        console.error("Error getting user email:", error);
    }
    return null;
}

async function saveMovieRating(movieTitle, rating) {
    console.log(`Attempting to save rating ${rating} for "${movieTitle}"`);

    try {
        const userEmail = await getCurrentUserEmail();
        console.log("User email for rating:", userEmail);

        if (userEmail) {
            // Fetch OMDB data for the movie
            const movieDataResponse = await chrome.runtime.sendMessage({
                movieName: movieTitle,
                type: "MovieQuery",
            });

            let movieData;
            if (
                movieDataResponse &&
                !movieDataResponse.error &&
                movieDataResponse.movieData &&
                movieDataResponse.movieData.Response !== "False"
            ) {
                movieData = {
                    ...movieDataResponse.movieData,
                    userRating: rating,
                    ratedAt: new Date().toISOString(),
                };
            } else {
                console.log("No OMDB data found, creating basic movie data");
                movieData = {
                    title: movieTitle,
                    id: movieTitle
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, "-")
                        .replace(/-+/g, "-")
                        .replace(/^-|-$/g, ""),
                    userRating: rating,
                    ratedAt: new Date().toISOString(),
                };
            }

            const movieId =
                movieData.imdbID ||
                movieData.id ||
                movieData.title
                    ?.toLowerCase()
                    .replace(/[^a-z0-9]/g, "-")
                    .replace(/-+/g, "-")
                    .replace(/^-|-$/g, "");

            console.log("🎬 RATING DEBUG - Sending rating message:", {
                userEmail,
                movieId,
                rating,
                movieTitle: movieData.title || movieData.Title,
                imdbID: movieData.imdbID,
                hasMovieData: !!movieData,
                movieDataKeys: Object.keys(movieData),
            });

            // Use the dedicated rating system
            const response = await chrome.runtime.sendMessage({
                type: "RATE_MOVIE",
                data: {
                    userEmail,
                    movieId,
                    movieData: movieData,
                    rating: rating,
                },
            });

            console.log("🎬 RATING DEBUG - Response:", response);
            console.log(
                "🎬 RATING DEBUG - Response success:",
                response?.success
            );
            console.log("🎬 RATING DEBUG - Response error:", response?.error);

            if (response.success) {
                console.log(
                    `✅ Successfully saved rating ${rating} for "${movieTitle}"`
                );

                // Update cache for consistency with MovieDetail
                const cacheKey = `rating-cache-${movieId}`;
                await chrome.storage.local.set({
                    [cacheKey]: {
                        rating,
                        timestamp: Date.now(),
                    },
                });
                console.log(`📦 Updated rating cache for ${movieTitle}`);
            } else {
                console.log(
                    `❌ Failed to save rating: ${
                        response.error || "Unknown error"
                    }`
                );
            }
        } else {
            console.log("❌ No user email found for rating");
        }
    } catch (error) {
        console.error("Error saving movie rating:", error);
    }
}

function createNetflixRatingModal(movieTitle, onRate, onClose) {
    const oldModal = document.getElementById("netflix-rating-modal");
    if (oldModal) oldModal.remove();

    const modal = document.createElement("div");
    modal.id = "netflix-rating-modal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9999999";
    modal.style.backgroundColor = "rgba(0,0,0,0.7)";
    modal.style.opacity = "0";
    modal.style.visibility = "hidden";
    modal.style.transition = "opacity 0.3s ease";

    modal.innerHTML = `
    <div class="modal-content" style="
        background:#181818; border-radius:8px; padding:24px; max-width:400px; width:90%;
        box-shadow:0 8px 32px rgba(0,0,0,0.5);
        text-align:center; position:relative;
        display:flex; flex-direction:column; gap:16px;
    ">
      <button class="close-button" style="
          position:absolute; top:12px; right:12px;
          width:32px; height:32px;
          background:none; border:none; cursor:pointer; color:#fff;
          font-size:20px;
      ">&times;</button>

      <h2 style="color:#fff; margin:0 0 16px 0;">Rate ${movieTitle}!</h2>
      <div class="star-rating" style="display:flex; gap:8px; justify-content:center;">
        ${[1, 2, 3, 4, 5]
            .map(
                (i) => `
          <button class="star" data-value="${i}" style="background:none; border:none; cursor:pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#444">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </button>
        `
            )
            .join("")}
      </div>

      <button id="cinemate-btn" style="
          background:#e50914; color:#fff; border:none; border-radius:6px; padding:12px 16px;
          cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; gap:8px;
      ">
        <span class="btn-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg></span>
        <span class="btn-text">Add to my CineMate List</span>
      </button>
    </div>
  `;

    document.body.appendChild(modal);

    // Show modal with fade-in
    setTimeout(() => {
        modal.style.opacity = "1";
        modal.style.visibility = "visible";
    }, 50);

    // Fetch movie data from OMDB and add to watch history
    (async () => {
        console.log("Fetching movie data and adding to watch history...");
        const userEmail = await getCurrentUserEmail();
        console.log("User email:", userEmail);

        if (userEmail) {
            try {
                // First, get full movie data from OMDB
                console.log(`Fetching OMDB data for: "${movieTitle}"`);
                const movieDataResponse = await chrome.runtime.sendMessage({
                    movieName: movieTitle,
                    type: "MovieQuery",
                });

                let movieData;
                if (
                    movieDataResponse &&
                    !movieDataResponse.error &&
                    movieDataResponse.movieData &&
                    movieDataResponse.movieData.Response !== "False"
                ) {
                    console.log(
                        "✅ Got OMDB data:",
                        movieDataResponse.movieData
                    );
                    movieData = {
                        ...movieDataResponse.movieData,
                        watchedAt: new Date().toISOString(),
                    };
                } else {
                    console.log(
                        "❌ Failed to get OMDB data, using title only:",
                        movieDataResponse?.error ||
                            movieDataResponse?.movieData?.Error
                    );
                    movieData = {
                        title: movieTitle,
                        id: movieTitle
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, "-")
                            .replace(/-+/g, "-")
                            .replace(/^-|-$/g, ""),
                        watchedAt: new Date().toISOString(),
                    };
                }

                console.log("Sending ADD_TO_WATCH_HISTORY message:", {
                    userEmail,
                    movieData,
                });

                const response = await chrome.runtime.sendMessage({
                    type: "ADD_TO_WATCH_HISTORY",
                    data: { userEmail, movieData },
                });
                console.log("Watch history response:", response);

                if (response.success) {
                    console.log(`✅ Added "${movieTitle}" to watch history`);
                } else {
                    console.log(
                        `❌ Failed to add "${movieTitle}" to watch history:`,
                        response.error
                    );
                }
            } catch (error) {
                console.error("Error adding to watch history:", error);
            }
        } else {
            console.log("❌ No user email found, skipping watch history");
        }
    })();

    // Star rating logic
    const stars = modal.querySelectorAll(".star");
    let rating = 0;
    stars.forEach((star) => {
        const value = parseInt(star.dataset.value);
        star.addEventListener("mouseenter", () => {
            stars.forEach((s) => {
                const svg = s.querySelector("svg");
                svg.setAttribute(
                    "fill",
                    parseInt(s.dataset.value) <= value ? "#ffd700" : "#444"
                );
            });
        });
        star.addEventListener("mouseleave", () => {
            stars.forEach((s) => {
                const svg = s.querySelector("svg");
                svg.setAttribute(
                    "fill",
                    parseInt(s.dataset.value) <= rating ? "#ffd700" : "#444"
                );
            });
        });
        star.addEventListener("click", () => {
            rating = value;
            stars.forEach((s) => {
                const svg = s.querySelector("svg");
                svg.setAttribute(
                    "fill",
                    parseInt(s.dataset.value) <= rating ? "#ffd700" : "#444"
                );
            });
            if (onRate) onRate(rating);

            // Update watch history with rating
            (async () => {
                console.log(
                    `Attempting to save rating ${rating} for "${movieTitle}"`
                );
                const userEmail = await getCurrentUserEmail();
                console.log("User email for rating:", userEmail);

                if (userEmail) {
                    try {
                        // Get full movie data first to ensure we have IMDB ID
                        const movieDataResponse =
                            await chrome.runtime.sendMessage({
                                movieName: movieTitle,
                                type: "MovieQuery",
                            });

                        let movieData;
                        if (
                            movieDataResponse &&
                            !movieDataResponse.error &&
                            movieDataResponse.movieData &&
                            movieDataResponse.movieData.Response !== "False"
                        ) {
                            movieData = {
                                ...movieDataResponse.movieData,
                                ratedAt: new Date().toISOString(),
                            };
                        } else {
                            movieData = {
                                title: movieTitle,
                                id: movieTitle
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]/g, "-")
                                    .replace(/-+/g, "-")
                                    .replace(/^-|-$/g, ""),
                                ratedAt: new Date().toISOString(),
                            };
                        }

                        console.log("Sending rating update message:", {
                            userEmail,
                            movieData,
                        });
                        const response = await chrome.runtime.sendMessage({
                            type: "ADD_TO_WATCH_HISTORY",
                            data: { userEmail, movieData },
                        });
                        console.log("Rating update response:", response);

                        if (response.success) {
                            console.log(
                                `✅ Updated "${movieTitle}" watch history with rating: ${rating}`
                            );
                        } else {
                            console.log(
                                `❌ Failed to update rating:`,
                                response.error
                            );
                        }
                    } catch (error) {
                        console.error("Error saving rating:", error);
                    }
                } else {
                    console.log("❌ No user email found for rating");
                }
            })();
        });
    });

    // Close modal
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.remove();
            if (onClose) onClose();
        }
    });
    modal.querySelector(".close-button").addEventListener("click", () => {
        modal.remove();
        if (onClose) onClose();
    });

    // CineMate button logic
    const cineBtn = modal.querySelector("#cinemate-btn");
    let addedToList = false;
    cineBtn.addEventListener("click", async () => {
        // Check if user is authenticated
        try {
            const result = await chrome.storage.local.get(["authToken"]);
            if (!result.authToken) {
                // User is not authenticated, open the extension popup to MyList page
                chrome.runtime.sendMessage({
                    action: "openPopup",
                    view: "myList",
                });
                modal.remove();
                return;
            }
        } catch (error) {
            console.error("Error checking authentication:", error);
            // If there's an error, assume not authenticated and redirect
            chrome.runtime.sendMessage({
                action: "openPopup",
                view: "myList",
            });
            modal.remove();
            return;
        }

        // User is authenticated, proceed with adding to list
        console.log("Attempting to add to list...");
        const userEmail = await getCurrentUserEmail();
        console.log(
            "User email for list:",
            userEmail,
            "Already added:",
            addedToList
        );

        if (userEmail && !addedToList) {
            try {
                // Get full movie data first to ensure we have all OMDB info
                console.log(`Fetching OMDB data for list: "${movieTitle}"`);
                const movieDataResponse = await chrome.runtime.sendMessage({
                    movieName: movieTitle,
                    type: "MovieQuery",
                });

                let movieData;
                if (
                    movieDataResponse &&
                    !movieDataResponse.error &&
                    movieDataResponse.movieData &&
                    movieDataResponse.movieData.Response !== "False"
                ) {
                    console.log(
                        "✅ Got OMDB data for list:",
                        movieDataResponse.movieData
                    );
                    movieData = {
                        ...movieDataResponse.movieData,
                        addedAt: new Date().toISOString(),
                    };
                } else {
                    console.log(
                        "❌ Failed to get OMDB data for list, using title only:",
                        movieDataResponse?.error ||
                            movieDataResponse?.movieData?.Error
                    );
                    movieData = {
                        title: movieTitle,
                        id: movieTitle
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, "-")
                            .replace(/-+/g, "-")
                            .replace(/^-|-$/g, ""),
                        addedAt: new Date().toISOString(),
                    };
                }

                console.log("Sending ADD_MOVIE_TO_LIST message:", {
                    userEmail,
                    listId: "watchlist",
                    movieData,
                });
                const response = await chrome.runtime.sendMessage({
                    type: "ADD_MOVIE_TO_LIST",
                    data: {
                        userEmail,
                        listId: "watchlist",
                        movieData,
                    },
                });
                console.log("Add to list response:", response);

                if (response.success) {
                    addedToList = true;
                    const icon = cineBtn.querySelector(".btn-icon");
                    const text = cineBtn.querySelector(".btn-text");
                    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
                    text.textContent = "Added to List!";
                    cineBtn.style.background = "#4CAF50";
                    cineBtn.disabled = true;
                    console.log(`✅ ${movieTitle} added to CineMate List`);
                } else {
                    console.log(`❌ Failed to add to list:`, response.error);
                }
            } catch (error) {
                console.error("Error adding to list:", error);
            }
        } else if (!userEmail) {
            console.log("❌ No user email found for adding to list");
        } else if (addedToList) {
            console.log("❌ Already added to list");
        }
    });
}

function getCurrentTitle() {
    // Try multiple selectors to get the current/ended movie title
    let movieTitle = document.querySelector(
        '[data-uia="postplay-rating-title"]'
    )?.textContent;

    if (!movieTitle) {
        // Try to get title from other Netflix elements
        movieTitle = document.querySelector(
            '[data-uia="video-title"]'
        )?.textContent;
    }

    if (!movieTitle) {
        // Try to get from page title (remove " - Netflix")
        movieTitle = document.title.replace(" - Netflix", "");
    }

    return movieTitle || "Unknown Title";
}

let currentPath = location.pathname;
let endScreenObserver = null;

function onRouteChange(newPath) {
    console.log("Route changed to:", newPath);

    if (!newPath.startsWith("/watch") && endScreenObserver) {
        console.log("Leaving watch page, disconnecting observer");
        endScreenObserver.disconnect();
        endScreenObserver = null;
        const popup = document.getElementById("netflix-rating-modal");
        if (popup) popup.remove();
    }

    if (newPath.startsWith("/watch")) {
        console.log("Entering watch page, setting up end screen observer");
        setTimeout(startEndScreenObserver, 500);
    }
}

["pushState", "replaceState"].forEach((methodName) => {
    const original = history[methodName];
    history[methodName] = function (...args) {
        const result = original.apply(this, args);
        if (location.pathname !== currentPath) {
            currentPath = location.pathname;
            onRouteChange(currentPath);
        }
        return result;
    };
});

window.addEventListener("popstate", () => {
    if (location.pathname !== currentPath) {
        currentPath = location.pathname;
        onRouteChange(currentPath);
    }
});

setInterval(() => {
    if (location.pathname !== currentPath) {
        currentPath = location.pathname;
        onRouteChange(currentPath);
    }
}, 250);

function startEndScreenObserver() {
    if (endScreenObserver) return;
    endScreenObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1) continue;
                const backToBrowseBtn = node.querySelector(
                    '[data-uia="postplay-back-to-browse"]'
                );
                if (backToBrowseBtn) {
                    console.log("End screen detected!");

                    // Try to get the title from the end screen itself
                    let title =
                        node.querySelector('[data-uia="postplay-rating-title"]')
                            ?.textContent ||
                        node.querySelector('[data-uia="video-title"]')
                            ?.textContent ||
                        backToBrowseBtn
                            .closest('[data-uia*="postplay"]')
                            ?.querySelector('[data-uia*="title"]')?.textContent;

                    if (!title) {
                        // Fallback to general title detection
                        title = getCurrentTitle();
                    }

                    console.log("Captured movie title from end screen:", title);

                    // Small delay to ensure the end screen is fully loaded
                    setTimeout(() => {
                        createNetflixRatingModal(title, async (rating) => {
                            console.log("User rated:", rating);
                            await saveMovieRating(title, rating);
                        });
                    }, 500);
                }
            }
        }
    });
    endScreenObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

onRouteChange(location.pathname);
