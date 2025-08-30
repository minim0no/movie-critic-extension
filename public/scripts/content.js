const popup = document.createElement("div");
popup.style.position = "fixed";
popup.style.background = "rgba(0,0,0,0.95)";
popup.style.backdropFilter = "blur(10px)";
popup.style.border = "1px solid rgba(255,255,255,0.1)";
popup.style.borderRadius = "0.75rem";
popup.style.boxShadow = "0 25px 50px -12px rgba(0,0,0,0.8)";
popup.style.zIndex = "10000";
popup.style.pointerEvents = "none";
popup.style.opacity = "0";
popup.style.transition = "opacity 0.2s ease, transform 0.2s ease";
popup.style.transform = "scale(0.9)";
popup.style.fontSize = "16px";

document.body.appendChild(popup);

const starSVG = `
<div style="width:1.5rem; height:1.5rem; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem;">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#eab308" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star-icon lucide-star">
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>
    </svg>
</div>
`;

const usersSVG = `
<div style="width:1.5rem; height:1.5rem; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem;">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users-icon lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>
</div>
`;

const spotlightSVG = `
<div style="width:1.5rem; height:1.5rem; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem;">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-spotlight-icon">
    <!-- Spotlight beams/lights -->
    <path d="M15.295 19.562 16 22" stroke="#FBBF24"/>
    <path d="m17 16 3.758 2.098" stroke="#FBBF24"/>
    <path d="m19 12.5 3.026-.598" stroke="#FBBF24"/>
    
    <!-- Spotlight body -->
    <path d="M7.61 6.3a3 3 0 0 0-3.92 1.3l-1.38 2.79a3 3 0 0 0 1.3 3.91l6.89 3.597a1 1 0 0 0 1.342-.447l3.106-6.211a1 1 0 0 0-.447-1.341z" fill="#010057" stroke="#010057"/>
    
    <!-- Handle -->
    <path d="M8 9V2" stroke="#010057"/>
    </svg>
</div>
`;

const trophySVG = `
<div style="width:1.5rem; height:1.5rem; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem;">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="lucide lucide-trophy-icon lucide-trophy">
    <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/>
    <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/>
    <path d="M18 9h1.5a1 1 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/>
    <path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>
    </svg>
</div>
`;

const sparklesSVG = `
<div style="width:1.5rem; height:1.5rem; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem;">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="lucide lucide-sparkles-icon lucide-sparkles">
    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
    <path d="M20 2v4"/>
    <path d="M22 4h-4"/>
    <circle cx="4" cy="20" r="2" fill="#a855f7"/>
    </svg>
</div>`;

// helper to populate popup
function populatePopup(movie) {
    popup.innerHTML = `
      <div style="padding:1rem; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; gap:0.75rem;">
        <img src="${
            movie.Poster
        }" style="width:4rem; height:6rem; object-fit:cover; border-radius:0.375rem; flex-shrink:0;">
        <div style="flex:1; min-width:0;">
          <h4 style="font-weight:600; line-height:1.2; margin:0; margin-bottom:0.5rem; font-size:1.3rem;">${
              movie.Title
          }</h4>
          <div style="display:inline-block; background:rgba(255,255,255,0.1); padding:0.125rem 0.5rem; border-radius:0.25rem; font-size:1.1rem; margin-bottom:0.5rem;">${
              movie.totalSeasons ? movie.totalSeasons + " Season(s)" : ""
          }</div>
          <div style="display:inline-block; background:rgba(255,255,255,0.1); padding:0.125rem 0.5rem; border-radius:0.25rem; font-size:1.1rem; margin-bottom:0.5rem;">${
              movie.Runtime
          }</div>
          <div style="display:inline-block; background:rgba(255,255,255,0.1); padding:0.125rem 0.5rem; border-radius:0.25rem; font-size:1.1rem; margin-bottom:0.5rem;">${
              movie.Year
          }
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:0.25rem;">
            ${movie.Genre.slice(0, 2)
                .map(
                    (g) =>
                        `<span style="background:transparent; border:1px solid rgba(255,255,255,0.2); padding:0.125rem 0.375rem; border-radius:0.25rem; font-size:1.1rem; color:#d1d5db;">${g}</span>`
                )
                .join("")}
          </div>
        </div>
      </div>
      <div style="padding:1rem;">
        <div style="margin-bottom:1rem;">
          <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem;">
            <div style="display:flex; align-items:center; gap:0.375rem;">
            ${starSVG}
              <span style="font-weight:600;">${movie.imdbRating}</span>
              <span style="color:#9ca3af; font-size:1.1rem;">IMDb</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.375rem; color:#9ca3af; font-size:1.1rem;">
            ${usersSVG}
              ${movie.imdbVotes.toLocaleString()} votes
            </div>
          </div>
        ${
            movie.rottenTomatoesScore
                ? `
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <div style="width:1.5rem; height:1.5rem; background:#dc2626; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.1rem;">🍅</div>
            <span style="font-weight:600;">${movie.rottenTomatoesScore}</span>
            <span style="color:#9ca3af; font-size:1.1rem;">Rotten Tomatoes</span>
          </div>
            `
                : ""
        }
        </div>
        <div style="height:1px; background:rgba(255,255,255,0.1); margin:1rem 0;"></div>
        <div style="margin-bottom:1rem;">
        <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
            ${spotlightSVG}
            <h4 style="font-size:1.3rem; font-weight:600; margin: 0;">Cast</h4>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:0.25rem;">
            ${movie.Actors.slice(0, 3)
                .map(
                    (a) =>
                        `<span style="background:rgba(255,255,255,0.1); padding:0.125rem 0.375rem; border-radius:0.25rem; font-size:1.1rem;">${a}</span>`
                )
                .join("")}
            ${
                movie.Actors.length > 3
                    ? `<span style="background:rgba(255,255,255,0.1); padding:0.125rem 0.375rem; border-radius:0.25rem; font-size:1.1rem;">+${
                          movie.Actors.length - 3
                      } more</span>`
                    : ""
            }
          </div>
        </div>
        <div style="height:1px; background:rgba(255,255,255,0.1); margin:1rem 0;"></div>
        ${
            movie.Awards
                ? `
        ${
            movie.Awards && movie.Awards.length
                ? `<div style="margin-bottom:1rem;">
                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
                    ${trophySVG}
                    <h4 style="font-size:1.3rem; font-weight:600; margin:0;"> Awards</h4>
                </div>
          <div style="color:#9ca3af; font-size:1.1rem; line-height:1.4;">
            ${movie.Awards.slice(0, 2)
                .map((a) => `<div style="margin-bottom:0.25rem;">${a}</div>`)
                .join("")}
          </div>
        </div><div style="height:1px; background:rgba(255,255,255,0.1); margin:1rem 0;"></div>`
                : ""
        }`
                : ""
        }
        <div>
        ${
            movie.aiCritique
                ? `
        <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
            ${sparklesSVG}
            <h4 style="font-size:1.3rem; font-weight:600; margin: 0;">AI Critique</h4>
        </div>
          <p style="color:#9ca3af; font-size:1.1rem; line-height:1.5; margin-top: 0;">${movie.aiCritique}</p>
          `
                : ""
        }
        </div>
      </div>
    `;
}

function positionPopup(previewModal) {
    const imageRect = previewModal.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();

    let infoTop = imageRect.top;
    let infoLeft = imageRect.left;

    if (imageRect.left <= bodyRect.width / 2) {
        infoLeft += imageRect.width;
    } else {
        infoLeft -= imageRect.width + 50;
    }

    if (infoLeft <= 0) {
        infoLeft = 0;
    }

    if (infoLeft >= bodyRect.width) {
        infoLeft = bodyRect.width - imageRect.width;
    }

    popup.style.top = infoTop + "px";
    popup.style.left = infoLeft + "px";
    popup.style.width = imageRect.width + 50 + "px";
    popup.style.minHeight = imageRect.height + "px";
}

function cleanData(data) {
    data.Title = data.Title || "";
    data.Runtime = data.Runtime || "";
    data.totalSeasons = data.totalSeasons || null;
    data.Year = data.Year || "";
    data.Genre = data.Genre.split(", ") || [];
    data.Actors = data.Actors.split(", ") || [];
    data.Awards = data.Awards.split(". ") || [];
    data.Poster = data.Poster || "https://placehold.co/200x200.png?text=?";
    data.imdbRating = data.imdbRating || "N/A";
    data.rottenTomatoesScore =
        data.Ratings.find((r) => r.Source === "Rotten Tomatoes")?.Value || "";
    data.imdbVotes = data.imdbVotes || "N/A";
    data.aiCritique = data.aiCritique || "No critique available.";
    return data;
}

function detectHover() {
    let movieIMGs = document.querySelectorAll(".boxart-image");
    let hoverTimer;
    let previewModal = undefined;
    try {
        for (let movieIMG of movieIMGs) {
            movieIMG.onmouseenter = () => {
                clearTimeout(hoverTimer);
                popup.style.display = "none";

                setTimeout(() => {
                    previewModal = document.getElementsByClassName(
                        "previewModal--container mini-modal has-smaller-buttons"
                    )[0];
                    if (previewModal != null) {
                        console.log("on");
                        previewModal.onmouseleave = () => {
                            clearTimeout(hoverTimer);
                            popup.style.display = "none";
                        };
                    }
                }, 500);

                hoverTimer = setTimeout(() => {
                    let movieTitle = movieIMG.nextElementSibling?.innerText;
                    if (!movieTitle) return;
                    movieTitle = movieTitle.trim().toLowerCase();
                    console.log("Fetching data for:", movieTitle);
                    (async () => {
                        const response = await chrome.runtime.sendMessage({
                            movieName: movieTitle,
                        });
                        console.log("Response from background:", response);

                        if (previewModal != null) {
                            try {
                                if (response.movieData.Response === "True") {
                                    const cleanedData = cleanData(
                                        response.movieData
                                    );
                                    console.log("Cleaned Data:", cleanedData);
                                    populatePopup(cleanedData);
                                    positionPopup(previewModal);
                                    popup.style.display = "block";
                                    setTimeout(() => {
                                        popup.style.opacity = "1";
                                        popup.style.transform = "scale(1)";
                                    }, 100);
                                }
                            } catch (e) {
                                console.error("Error populating popup:", e);
                            }
                        }
                    })();
                }, 1000);

                let interval = setInterval(() => {
                    if (!document.body.contains(movieIMG)) {
                        clearInterval(interval);
                        popup.style.display = "none";
                    }
                }, 100);
            };
        }
    } catch (error) {
        console.log(error);
    }
}

window.addEventListener("load", () => {
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.type === "childList") {
                detectHover();
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    detectHover();
});
