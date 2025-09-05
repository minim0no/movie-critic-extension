/* global chrome */
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase-config";

// User Management
export const createUser = async (userId, userData) => {
    try {
        await setDoc(doc(db, "users", userId), {
            ...userData,
            createdAt: serverTimestamp(),
            lastActiveAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, error: error.message };
    }
};

// List Management
export const createList = async (userId, listName) => {
    try {
        const listRef = await addDoc(collection(db, "users", userId, "lists"), {
            name: listName,
            createdAt: serverTimestamp(),
            isDefault: false,
        });
        return { success: true, listId: listRef.id };
    } catch (error) {
        console.error("Error creating list:", error);
        return { success: false, error: error.message };
    }
};

export const getUserLists = async (userId) => {
    try {
        const listsRef = collection(db, "users", userId, "lists");
        const snapshot = await getDocs(
            query(listsRef, orderBy("createdAt", "desc"))
        );

        const lists = [];
        snapshot.forEach((doc) => {
            lists.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, lists };
    } catch (error) {
        console.error("Error getting user lists:", error);
        return { success: false, error: error.message };
    }
};

// Movie Management in Lists
export const addMovieToList = async (userId, listId, movieData) => {
    try {
        const movieRef = doc(
            db,
            "users",
            userId,
            "lists",
            listId,
            "movies",
            movieData.imdbId
        );
        await setDoc(movieRef, {
            ...movieData,
            addedAt: serverTimestamp(),
            userRating: null,
        });
        return { success: true };
    } catch (error) {
        console.error("Error adding movie to list:", error);
        return { success: false, error: error.message };
    }
};

export const rateMovieInList = async (userId, listId, movieId, rating) => {
    try {
        const movieRef = doc(
            db,
            "users",
            userId,
            "lists",
            listId,
            "movies",
            movieId
        );
        await updateDoc(movieRef, {
            userRating: rating,
            ratedAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error rating movie:", error);
        return { success: false, error: error.message };
    }
};

export const getMoviesInList = async (userId, listId) => {
    try {
        const moviesRef = collection(
            db,
            "users",
            userId,
            "lists",
            listId,
            "movies"
        );
        const snapshot = await getDocs(
            query(moviesRef, orderBy("addedAt", "desc"))
        );

        const movies = [];
        snapshot.forEach((doc) => {
            movies.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, movies };
    } catch (error) {
        console.error("Error getting movies in list:", error);
        return { success: false, error: error.message };
    }
};

// Watch History
export const addToWatchHistory = async (userId, movieData) => {
    try {
        const historyRef = doc(
            db,
            "users",
            userId,
            "watchHistory",
            movieData.imdbId
        );
        await setDoc(historyRef, {
            ...movieData,
            watchedAt: serverTimestamp(),
            completedPercentage: 100,
            deviceType: "chrome-extension",
        });
        return { success: true };
    } catch (error) {
        console.error("Error adding to watch history:", error);
        return { success: false, error: error.message };
    }
};

export const getWatchHistory = async (userId, limitCount = 50) => {
    try {
        const historyRef = collection(db, "users", userId, "watchHistory");
        const snapshot = await getDocs(
            query(historyRef, orderBy("watchedAt", "desc"), limit(limitCount))
        );

        const history = [];
        snapshot.forEach((doc) => {
            history.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, history };
    } catch (error) {
        console.error("Error getting watch history:", error);
        return { success: false, error: error.message };
    }
};

// Advanced Queries
export const getHighRatedMovies = async (userId, minRating = 4) => {
    try {
        // Note: This requires a composite index in Firestore
        const listsSnapshot = await getDocs(
            collection(db, "users", userId, "lists")
        );
        const highRatedMovies = [];

        for (const listDoc of listsSnapshot.docs) {
            const moviesRef = collection(
                db,
                "users",
                userId,
                "lists",
                listDoc.id,
                "movies"
            );
            const moviesSnapshot = await getDocs(
                query(moviesRef, where("userRating", ">=", minRating))
            );

            moviesSnapshot.forEach((movieDoc) => {
                highRatedMovies.push({
                    id: movieDoc.id,
                    listId: listDoc.id,
                    listName: listDoc.data().name,
                    ...movieDoc.data(),
                });
            });
        }

        return { success: true, movies: highRatedMovies };
    } catch (error) {
        console.error("Error getting high rated movies:", error);
        return { success: false, error: error.message };
    }
};
