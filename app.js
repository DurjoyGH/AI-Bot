require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const genAI = new GoogleGenerativeAI(process.env.API);

app.set("view engine", "ejs"); 
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("question");
});

app.post("/question", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).send("Question is required.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(question);
    const response = await result.response;
    const answer = await response.text();

    res.render("answer", { question, answer });
  } catch (error) {
    console.error("Error generating content:", error.message);
    res.status(500).send("Failed to fetch the answer. Please try again later.");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
