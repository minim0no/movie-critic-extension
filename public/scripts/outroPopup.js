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

        // User is authenticated, proceed with adding/removing from list
        addedToList = !addedToList;
        const icon = cineBtn.querySelector(".btn-icon");
        const text = cineBtn.querySelector(".btn-text");
        if (addedToList) {
            icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
            text.textContent = "Remove from my CineMate List";
            console.log(`${movieTitle} added to CineMate List`);
        } else {
            icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`;
            text.textContent = "Add to my CineMate List";
            console.log(`${movieTitle} removed from CineMate List`);
        }
    });
}

function getCurrentTitle() {
    const movieTitle = document.querySelector(
        '[data-uia="postplay-rating-title"]'
    )?.textContent;

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
                    const title = getCurrentTitle();
                    createNetflixRatingModal(title, (rating) =>
                        console.log("User rated:", rating)
                    );
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
