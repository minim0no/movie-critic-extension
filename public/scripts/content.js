const movieData = {
    shawshank: {
        name: "The Shawshank Redemption",
        imdbRating: 9.3,
        voterCount: 2800000,
        rottenTomatoesScore: 91,
        actors: [
            "Tim Robbins",
            "Morgan Freeman",
            "Bob Gunton",
            "William Sadler",
            "Clancy Brown",
        ],
        awards: [
            "Academy Award Nominee - Best Picture",
            "Golden Globe Nominee - Best Motion Picture",
        ],
        runtime: "2h 22m",
        genre: ["Drama", "Crime"],
        aiCritique:
            "A masterful exploration of hope and friendship within the confines of prison walls. The film's emotional depth and Freeman's iconic narration create an unforgettable cinematic experience that transcends its genre.",
        posterUrl:
            "https://images.unsplash.com/photo-1753944847480-92f369a5f00e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    inception: {
        name: "Inception",
        imdbRating: 8.8,
        voterCount: 2400000,
        rottenTomatoesScore: 87,
        actors: [
            "Leonardo DiCaprio",
            "Marion Cotillard",
            "Tom Hardy",
            "Ellen Page",
        ],
        awards: [
            "Academy Award Winner - Best Cinematography",
            "BAFTA Winner - Best Visual Effects",
        ],
        runtime: "2h 28m",
        genre: ["Sci-Fi", "Thriller"],
        aiCritique:
            "Nolan's intricate dreamscape thriller challenges viewers with layered storytelling and stunning visuals. A mind-bending journey that rewards multiple viewings and deep contemplation.",
        posterUrl:
            "https://images.unsplash.com/photo-1562618900-07538435c375?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    pulp: {
        name: "Pulp Fiction",
        imdbRating: 8.9,
        voterCount: 2100000,
        rottenTomatoesScore: 92,
        actors: [
            "John Travolta",
            "Samuel L. Jackson",
            "Uma Thurman",
            "Bruce Willis",
        ],
        awards: [
            "Academy Award Winner - Best Original Screenplay",
            "Palme d'Or Winner",
        ],
        runtime: "2h 34m",
        genre: ["Crime", "Drama"],
        aiCritique:
            "Tarantino's non-linear masterpiece revolutionized cinema with its sharp dialogue and interconnected storylines. A cultural phenomenon that redefined independent filmmaking.",
        posterUrl:
            "https://images.unsplash.com/photo-1701294458496-59a3fd98c2ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
};

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
popup.style.transform = "scale(0.9)";
popup.style.transition = "opacity 0.2s ease, transform 0.2s ease";
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
            movie.posterUrl
        }" style="width:4rem; height:6rem; object-fit:cover; border-radius:0.375rem; flex-shrink:0;">
        <div style="flex:1; min-width:0;">
          <h4 style="font-weight:600; line-height:1.2; margin:0; margin-bottom:0.5rem; font-size:1.3rem;">${
              movie.name
          }</h4>
          <div style="display:inline-block; background:rgba(255,255,255,0.1); padding:0.125rem 0.5rem; border-radius:0.25rem; font-size:1.1rem; margin-bottom:0.5rem;">${
              movie.runtime
          }</div>
          <div style="display:flex; flex-wrap:wrap; gap:0.25rem;">
            ${movie.genre
                .slice(0, 2)
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
              <span style="font-weight:600;">${movie.imdbRating}/10</span>
              <span style="color:#9ca3af; font-size:1.1rem;">IMDB</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.375rem; color:#9ca3af; font-size:1.1rem;">
            ${usersSVG}
              ${movie.voterCount.toLocaleString()} votes
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <div style="width:1.5rem; height:1.5rem; background:#dc2626; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.1rem;">🍅</div>
            <span style="font-weight:600;">${movie.rottenTomatoesScore}%</span>
            <span style="color:#9ca3af; font-size:1.1rem;">Rotten Tomatoes</span>
          </div>
        </div>
        <div style="height:1px; background:rgba(255,255,255,0.1); margin:1rem 0;"></div>
        <div style="margin-bottom:1rem;">
          <h4 style="font-size:1.3rem; font-weight:600; margin: 0; margin-bottom:0.5rem;">Cast</h4>
          <div style="display:flex; flex-wrap:wrap; gap:0.25rem;">
            ${movie.actors
                .slice(0, 3)
                .map(
                    (a) =>
                        `<span style="background:rgba(255,255,255,0.1); padding:0.125rem 0.375rem; border-radius:0.25rem; font-size:1.1rem;">${a}</span>`
                )
                .join("")}
            ${
                movie.actors.length > 3
                    ? `<span style="background:rgba(255,255,255,0.1); padding:0.125rem 0.375rem; border-radius:0.25rem; font-size:1.1rem;">+${
                          movie.actors.length - 3
                      } more</span>`
                    : ""
            }
          </div>
        </div>
        <div style="height:1px; background:rgba(255,255,255,0.1); margin:1rem 0;"></div>
        ${
            movie.awards && movie.awards.length
                ? `<div style="margin-bottom:1rem;">
                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
                    ${trophySVG}
                    <h4 style="font-size:1.3rem; font-weight:600; margin:0;"> Awards</h4>
                </div>
          <div style="color:#9ca3af; font-size:1.1rem; line-height:1.4;">
            ${movie.awards
                .slice(0, 2)
                .map((a) => `<div style="margin-bottom:0.25rem;">${a}</div>`)
                .join("")}
          </div>
        </div><div style="height:1px; background:rgba(255,255,255,0.1); margin:1rem 0;"></div>`
                : ""
        }
        <div>
        <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
            ${sparklesSVG}
            <h4 style="font-size:1.3rem; font-weight:600; margin: 0;">AI Critique</h4>
        </div>
          <p style="color:#9ca3af; font-size:1.1rem; line-height:1.5; margin-top: 0;">${
              movie.aiCritique
          }</p>
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
        infoLeft -= imageRect.width;
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
                    let movieTitle = movieIMG.nextElementSibling.textContent;
                    (async () => {
                        const response = await chrome.runtime.sendMessage({
                            movieName: movieTitle,
                        });
                        console.log("Response from background:", response);

                        if (previewModal != null) {
                            populatePopup(movieData["shawshank"]);
                            positionPopup(previewModal);
                            popup.style.display = "block";
                            setTimeout(() => {
                                popup.style.opacity = "1";
                                popup.style.transform = "scale(1)";
                            }, 100);
                        }
                    })();
                }, 1000);
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
