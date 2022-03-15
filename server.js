const express = require("express");
const app = express();

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

// Import router d'un autre fichier JS
const hotels = require("./routers/hotels.js");
const restaurants = require("./routers/restaurants.js");

// SECTIONS DANS L'API
app.use("/hotels", hotels);
app.use("/restaurants", restaurants);

app.get("*", (_req, res) => {
  res.status(404).send("Error 404, cette page n'existe pas");
});

// LISTEN :
app.listen(8000, () => {
  console.log("LISTENING.....");
});
