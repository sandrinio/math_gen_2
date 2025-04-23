const {onRequest} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions/v2");
const {GoogleGenerativeAI} = require("@google/generative-ai");

exports.generateProblems = onRequest(async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      logger.error("GOOGLE_API_KEY is not set");
      res.status(500).send("Server error: API key not configured.");
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

    const prompt = "Generate 10 addition problems and 10 subtraction problems for an 8-year-old. " +
        "Use numbers between 1 and 49. The answer for subtraction problems should not be negative. " +
        "Provide the problems as a JSON array where each object has the format: " +
        "{ num1: number, num2: number, operation: '+' | '-', answer: number }";

    const result = await model.generateContent(prompt);
    const response = result.response;

    if (response && response.text) {
      const text = response.text();
      try {
        const problems = JSON.parse(text);
        res.status(200).json(problems);
      } catch (parseError) {
        logger.error("Error parsing JSON:", parseError);
        res.status(500).json({error: "Error parsing response from Google API", details: parseError.message});
      }
    } else {
      logger.error("Invalid response format from Google API:", response);
      res.status(500).json({error: "Invalid response format from Google API"});
    }
  } catch (error) {
    logger.error("Error generating problems:", error);
    res.status(500).json({error: "Error generating problems", details: error.message});
  }
});