const express = require("express");

const dotenv = require("dotenv");
dotenv.config({
  path: "./routers/config.env",
});

const { Pool } = require("pg");

const app = express();

const Postgres = new Pool({ ssl: { rejectUnauthorized: false } });

// Librairies
const rateLimit = require("express-rate-limit");
const { v4: uuidv4 } = require("uuid");

app.use(express.json());
app.use(
  rateLimit({
    windowMs: 1000 * 60, // = 1 minute
    max: 100,
    message: "You exceeded 100 requests in 1 minute limit!",
    headers: true,
  })
);

// Key API
const userKey = [];

// Crée un nouvel user :
app.post("/premium", (req, res) => {
  const key = uuidv4();
  userKey.push({
    username: req.body.username,
    key: key,
  });

  res.json(userKey);
});

// Récupère la key d'un user passé en URL :
app.get("/api-key", (req, res) => {
  const result = userKey.find((usr) => {
    return usr.username.toLowerCase() === req.query["username"];
  });

  res.json(result.key);
});

// Middleware check api key :
function checkKey(req, res, next) {
  const result = userKey.find((usr) => {
    return usr.key === req.query["api_key"];
  });

  if (result) {
    // console.log("Cette clef est valide");
    next();
  } else {
    res.status(405).json({
      message: "ERROR 405, not allowed",
      description: "Cette clef API n'existe pas ou n'est pas valide",
    });
  }
}

// Import router d'un autre fichier JS
const hotels = require("./routers/hotels.js");
const restaurants = require("./routers/restaurants.js");

// SECTIONS DANS L'API
app.use("/hotels", hotels); // Add checkKey
app.use("/restaurants", restaurants); // Add checkKey

app.get("*", (_req, res) => {
  res.status(404).send("Error 404, cette page n'existe pas");
});

// LISTEN :
app.listen(8000, () => {
  console.log("LISTENING.....");
});
