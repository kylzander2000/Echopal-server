const express = require("express");
const cors = require("cors");
// We don't need a special library for Gemini, we can use fetch!
// const fetch = require('node-fetch'); // Glitch now supports fetch natively

// Setup our server
const app = express();
app.use(cors()); // Allow our CodePen app to talk to this server
app.use(express.json()); // Allow the server to receive JSON data

// --- The Gemini-specific part starts here ---

// Get our secret key from the .env file
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// The Gemini API endpoint
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Create the main endpoint for our app to call
app.post("/ask-ai", async (req, res) => {
  try {
    const userInput = req.body.prompt;
    if (!userInput) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // This is the "system prompt" or personality for Gemini
    const systemPrompt = "You are EchoPal, a friendly, cheerful, and patient robot parrot named Pip. You are talking to a child. Keep your answers short, encouraging, and easy to understand. Never say you are an AI model. Start your very first response with a cheerful greeting.";
    
    // This is the data structure Gemini expects
    const requestBody = {
      contents: [
        {
          parts: [
            { text: systemPrompt }, // Giving the AI its personality
            { text: userInput }     // Giving the AI the user's question
          ]
        }
      ]
    };

    // Make the call to the Gemini API
    const apiResponse = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!apiResponse.ok) {
        throw new Error(`Google API responded with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    // Extract the text from Gemini's complex response structure
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Send the clean response back to our CodePen app
    res.json({ response: aiResponse });

  } catch (error) {
    console.error("Error calling Gemini AI:", error);
    res.status(500).json({ error: "Failed to get response from AI." });
  }
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your Gemini-powered app is listening on port " + listener.address().port);
});
