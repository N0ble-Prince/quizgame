import express from "express";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config()

const app = express();
const port = 3000;

//db.connect();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Supabase requires SSL
  }
});

let quiz = [];

pool.query("SELECT * FROM capitals", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    quiz = res.rows;
  }
  db.end();
});

let totalCorrect;

//Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

//Generate the year for footer
const year = new Date().getFullYear();

let currentQuestion = {}

//Get the home page
app.get("/", async (req, res) => {
    totalCorrect = 0;
    await nextQuestion();
    console.log(currentQuestion)

    res.render("index.ejs", {
        currentYear: year,
        correctScore: totalCorrect,
        question: currentQuestion,
    });
});

app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect;
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  } else {
    isCorrect = false;
    res.render("restart.ejs", {
        currentYear: year,
        totalScore: totalCorrect
    })
    return
  }


  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
    currentYear: year,
  });
});

async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];

  currentQuestion = randomCountry;
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);

});
