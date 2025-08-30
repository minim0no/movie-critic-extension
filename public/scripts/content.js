const popup = document.createElement("div");
const header = document.createElement("h1");

let OPENAI_API_KEY;
chrome.storage.local.get(["OPENAI_API_KEY"], function (result) {
    OPENAI_API_KEY = result.OPENAI_API_KEY;
});

function getScalingFactor(originalHeight, currentHeight) {
    return originalHeight / currentHeight;
}

function showPopup(previewModal, movie) {
    const scale = getScalingFactor(371, previewModal.offsetHeight);
    console.log("scale " + scale);
    const imageRect = previewModal.getBoundingClientRect();

    popup.innerHTML = `
    <div class="header">
        <div class="left">
            <h1>${movie.name}</h1>
            <ul>
                <li>${movie.year}</li>
                <li>${movie.runtime}</li>
                <li>${movie.genre}</li>
            <ul>
        </div>
        <div class="right">
            <div class="imdb">
                <div class="imdb-rating">⭐: ${movie.imdbRating}/10</div>
                <div class="imdb-votes">👤: ${movie.imdbVotes}</div>
            </div>
            <div class="rotten-tomatoes">🍅: ${movie.rottenTomatoesRating}</div>
            <div class="box-office">💰: ${movie.BoxOffice}</div>
        </div>
    </div>
    <div class="body">
        <div class="hero">
            <div class="actors">🎭: ${movie.actors}</div>
            <div class="awards">🏆: ${movie.awards}</div>
        </div>
        <div class="critique-container">
            <h1 class="clapperboard">Critique 🎬</h1>
            <div class="critique"></div>
            <div class="loader"></div>
        </div>
    </div>
    `;

    document.body.appendChild(popup);

    // header
    const header = popup.querySelector(".header");
    header.style.cssText = `
    display: flex;
    justify-content: space-between;
    margin: 0.5rem;
    `;

    //left
    const left = popup.querySelector(".left");
    left.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    `;

    //right
    const right = popup.querySelector(".right");
    right.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    `;
    right.style.fontSize = `${scale * 1.6}rem`;

    //title
    const title = popup.querySelector("h1");
    title.style.cssText = `
    text-align: left;
    margin: 0;
    padding: 0;
    `;
    title.style.fontSize = `${scale * 2}rem`;

    // list
    const list = popup.querySelector("ul");
    list.style.cssText = `
    list-style: none;
    padding: 0;
    margin: 0;
    `;
    list.style.fontSize = `${scale * 1.6}rem`;

    // hero
    const hero = popup.querySelector(".hero");
    hero.style.cssText = `
    display: flex;
    flex-direction: column;
    margin: 0.5rem;
    margin-top: 0.75rem;
    gap: 0.5rem;
    border-top: 1px solid rgba(0,0,0,.06);
    border-bottom: 1px solid rgba(0,0,0,.06);
    padding: 0.5rem;
    `;

    //actors
    const actors = popup.querySelector(".actors");
    actors.style.fontSize = `${scale * 1.55}rem`;

    //awards
    const awards = popup.querySelector(".awards");
    awards.style.fontSize = `${scale * 1.55}rem`;

    //critique-container
    const critiqueContainer = popup.querySelector(".critique-container");
    critiqueContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0.5rem;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    gap: 0.5rem;
    `;

    //clapperboard
    const clapperboard = popup.querySelector(".clapperboard");
    clapperboard.style.cssText = `
    margin: 0;
    padding: 0;
    `;
    clapperboard.style.fontSize = `${scale * 1.9}rem`;

    //loader
    const loader = popup.querySelector(".loader");
    loader.style.cssText = `
    border: 4px solid #f3f3f3; /* Light grey */
    border-top: 4px solid red; /* Blue */
    border-radius: 50%;
    width: 15px;
    height: 15px;
    animation: spin 0.5s linear infinite;
    `;

    const keyframes = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    `;
    const style = document.createElement("style");
    style.innerHTML = keyframes;
    document.head.appendChild(style);

    popup.className = "info-popup";

    popup.style.position = "fixed";
    popup.style.display = "block";
    popup.style.border = "1px outset";
    popup.style.padding = "0";
    popup.style.color = "black";
    popup.style.background = "rgba(255, 255, 255, 0.8)";
    popup.style.zIndex = "999";
    popup.style.overflow = "hidden";
    popup.style.borderRadius = "4px";

    const bodyRect = document.body.getBoundingClientRect();

    loader.style.marginTop = imageRect.height / 6.5 + "px";

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

    popup.style.top = infoTop + "px"; // change as needed later
    popup.style.left = infoLeft + "px";
    popup.style.width = imageRect.width + "px";
    popup.style.minHeight = imageRect.height + "px";

    popup.style.display = "block";
}

async function getCritique(movie) {
    try {
        const openai_response = await fetch(
            `https://api.openai.com/v1/chat/completions`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`, // Corrected here
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are a movie/series critic. Critique the movie/series sent in 50 words.",
                        },
                        { role: "user", content: movie.name },
                    ],
                    max_tokens: 80,
                    temperature: 0.7,
                }),
            }
        );

        const openai_data = await openai_response.json();
        console.log(openai_data);
        movie.critique = openai_data.choices[0].message.content;
    } catch (error) {
        console.log(error);
    }

    return movie;
}

function updatePopup(previewModal, movie) {
    const scale = getScalingFactor(371, previewModal.offsetHeight);

    const loader = popup.querySelector(".loader");
    loader.style.display = "none";

    const critique = popup.querySelector(".critique");
    critique.style.cssText = `
    margin-top: 0.25rem;
    `;
    critique.style.fontSize = `${scale * 1.6}rem`;

    critique.textContent = movie.critique;
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
                        if (previewModal != null) {
                            if (response.movie.Response === "True") {
                                showPopup(previewModal, response.movie);
                                const movie = await getCritique(response.movie);
                                updatePopup(previewModal, movie);
                            }
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
