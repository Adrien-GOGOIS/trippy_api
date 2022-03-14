const express = require("express");
const app = express();

app.use(express.json());

// Import router d'un autre fichier JS
const hostels = require("./routers/hostels.js");
const restaurants = require("./routers/restaurants.js");

// SECTIONS DANS L'API
app.use("/hostels", hostels);
app.use("/restaurants", restaurants);

// LISTEN :
app.listen(8000, () => {
  console.log("LISTENING.....");
});
