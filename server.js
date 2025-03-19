const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Load word dataset from dictionarylist.txt
const words = new Set(
    fs.readFileSync("dictionarylist.txt", "utf-8")
        .split("\n")
        .map(w => w.trim().toLowerCase())  // Convert words to lowercase
);

app.post("/validate", (req, res) => {
    const { word } = req.body;
    if (!word) {
        return res.status(400).json({ error: "No word provided" });
    }
    res.json({ valid: words.has(word.toLowerCase()) }); // Convert user word to lowercase
});

// Function to check if a word can be formed from given letters
const canBeFormed = (word, letters) => {
    let availableLetters = letters.split("");
    for (let char of word) {
        const index = availableLetters.indexOf(char);
        if (index === -1) return false;  // Letter not found
        availableLetters.splice(index, 1); // Remove used letter
    }
    return true;
};

const shuffleWord = (word) => {
    let letters = word.split(""); // Convert string to array
    for (let i = letters.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // Random index
        [letters[i], letters[j]] = [letters[j], letters[i]]; // Swap elements
    }
    return letters.join(""); // Convert back to string
};

app.get("/random-six-letter-word", (req, res) => {
    const sixLetterWords = [...words].filter(word => word.length === 6);
    if (sixLetterWords.length === 0) {
        return res.status(500).json({ error: "No six-letter words found." });
    }
    const randomWord = sixLetterWords[Math.floor(Math.random() * sixLetterWords.length)];
    const randomWordAnagram = shuffleWord(randomWord);
    res.json({ word: randomWordAnagram });
});

// API to get all possible words that can be formed from the given letters
app.post("/possible-words", (req, res) => {
    const { letters } = req.body;
    if (!letters) {
        return res.status(400).json({ error: "No letters provided" });
    }

    // Find words that can be formed using only the given letters
    const possibleWords = [...words].filter(word => canBeFormed(word, letters.toLowerCase()));

    res.json({ possibleWords });
});

app.listen(3001, () => console.log("Server running on port 3001"));