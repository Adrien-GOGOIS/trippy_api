const express = require("express");
const app = express();
const router = express.Router();

// Middleware
app.use(express.json());

app.use((_req, _res, next) => {
  console.log("requête reçu");
  next();
});

// Validation schema JOI
function validateSchema(req, res, next) {
  const validationResult = restaurantsSchema.validate(req.body);

  if (validationResult.error) {
    return res.status(400).json({
      message: validationResult.error.details[0].message,
      description: "Format non valide",
    });
  }
}

// JOI
const Joi = require("joi");

const restaurantsSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  adress: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string().required(),
  stars: Joi.number().min(1).max(5).required(),
  cuisine: Joi.string().required(),
  priceCategory: Joi.number().min(1).max(3).required(),
});

// Tableau des restaurants :
const restaurants = [
  {
    id: 1,
    name: "Les trois Mousquetaires",
    address: "22 av des Champs-Élysées",
    city: "Paris",
    country: "France",
    stars: 4,
    cuisine: "french",
    priceCategory: 3,
  },
  {
    id: 2,
    name: "The Fat Guy",
    address: "47 Jackson Boulevard",
    city: "New York",
    country: "US",
    stars: 5,
    cuisine: "burger",
    priceCategory: 1,
  },
  {
    id: 3,
    name: "Veggies",
    address: "77 Avenir Street",
    city: "Sydney",
    country: "Australia",
    stars: 5,
    cuisine: "vegan",
    priceCategory: 2,
  },
];

// ***** ROUTES ***** //

// GET
router.get("/", (_req, res) => {
  res.json(restaurants);
});

router.get("/:id", (req, res) => {
  const restaurant = restaurants.find((rest) => {
    return rest.id.toString() === req.params.id;
  });

  res.json(restaurant);
});

router.get("/countries/:country", (req, res) => {
  const restaurant = restaurants.find((host) => {
    return host.country.toLowerCase() === req.params.country.toLowerCase();
  });
  res.json(restaurant);
});

// POST
router.post("/", validateSchema, (req, res) => {
  restaurants.push({
    id: restaurants.length + 1,
    name: req.body.name,
    address: req.body.address,
    city: req.body.city,
    country: req.body.country,
    stars: req.body.stars,
    cuisine: req.body.cuisine,
    priceCategory: req.body.priceCategory,
  });

  res.json({
    message: "Ajout du restaurant " + req.body.name,
    restaurants: restaurants,
  });
});

// PATCH
router.patch("/:id", (req, res) => {
  const restaurant = restaurants.find((rest) => {
    return rest.id.toString() === req.params.id;
  });
  restaurant.name = req.body.name;
  res.json({
    message: "Mise à jour du restaurant n°" + req.params.id,
    restaurants: restaurants,
  });
});

// DELETE
router.delete("/:id", (req, res) => {
  const restaurant = restaurants.find((rest) => {
    return rest.id.toString() === req.params.id;
  });

  const index = restaurants.indexOf(restaurant);
  restaurants.splice(index, 1);

  res.json({
    message: "Le restaurant n°" + req.params.id + " a été supprimé",
    restaurants: restaurants,
  });
});

// On exporte le router
module.exports = router;
