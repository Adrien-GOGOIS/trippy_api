const express = require("express");
const app = express();

const rateLimit = require("express-rate-limit");

app.use(express.json());
app.use(
  rateLimit({
    windowMs: 1000 * 60, // = 1 minute
    max: 100,
    message: "You exceeded 100 requests in 1 minute limit!",
    headers: true,
  })
);

app.get("*", (_req, res) => {
  res.status(404).send("Error 404, cette page n'existe pas");
});

// Import router d'un autre fichier JS
const hotels = require("./routers/hotels.js");
const restaurants = require("./routers/restaurants.js");

// SECTIONS DANS L'API
app.use("/hotels", hotels);
app.use("/restaurants", restaurants);

// LISTEN :
app.listen(8000, () => {
  console.log("LISTENING.....");
});
