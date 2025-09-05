# main.py
from flask import Flask, request, jsonify
import numpy as np

app = Flask(__name__)

movies = [
    {"id": 1, "title": "The Matrix", "genres": ["sci-fi", "action"]},
    {"id": 2, "title": "Toy Story", "genres": ["animation", "family"]},
    {"id": 3, "title": "The Godfather", "genres": ["crime", "drama"]},
    {"id": 4, "title": "Finding Nemo", "genres": ["animation", "family"]},
    {"id": 5, "title": "John Wick", "genres": ["action", "thriller"]},
]

# Build genre vocabulary
all_genres = sorted({g for movie in movies for g in movie["genres"]})
genre_to_idx = {g: i for i, g in enumerate(all_genres)}

def movie_to_vec(genres):
    vec = np.zeros(len(all_genres))
    for g in genres:
        vec[genre_to_idx[g]] = 1
    return vec

for movie in movies:
    movie["vector"] = movie_to_vec(movie["genres"])

# Store user profile (simple example: in memory)
user_profile = np.zeros(len(all_genres))

@app.route("/rate", methods=["POST"])
def rate_movie():
    global user_profile
    data = request.json
    movie_id = data["movie_id"]
    rating = data["rating"]
    
    # Update user profile
    movie_vec = next(m["vector"] for m in movies if m["id"] == movie_id)
    user_profile += rating * movie_vec
    
    # Compute recommendations
    scores = []
    for m in movies:
        score = np.dot(user_profile, m["vector"])
        scores.append({"title": m["title"], "score": float(score)})
    
    # Sort and return top 3
    top_movies = sorted(scores, key=lambda x: x["score"], reverse=True)[:3]
    return jsonify(top_movies)

if __name__ == "__main__":
    app.run(debug=True)
