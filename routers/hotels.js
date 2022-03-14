const express = require("express");
const app = express();
const router = express.Router();

// Middleware
app.use(express.json());

app.use((_req, _res, next) => {
  console.log("requête reçu");
  next();
});

function validateSchema(req, res, next) {
  const validationResult = hotelsSchema.validate(req.body);

  if (validationResult.error) {
    return res.status(400).json({
      message: validationResult.error.details[0].message,
      description: "Format non valide",
    });
  }
}

// JOI
const Joi = require("joi");

const hotelsSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string().required(),
  stars: Joi.number().min(1).max(5).required(),
  hasSpa: Joi.boolean().required(),
  hasPool: Joi.boolean().required(),
  priceCategory: Joi.number().min(1).max(3).required(),
});

// Tableau des hôtels :
const hotels = [
  {
    id: 1,
    name: "Imperial Hotel",
    address: "84 av des Champs-Élysées",
    city: "Paris",
    country: "France",
    stars: 5,
    hasSpa: true,
    hasPool: true,
    priceCategory: 3,
  },
  {
    id: 2,
    name: "The Queen",
    address: "3 Darwin Street",
    city: "London",
    country: "England",
    stars: 4,
    hasSpa: true,
    hasPool: false,
    priceCategory: 3,
  },
  {
    id: 3,
    name: "Kiwi land",
    address: "4587 George St.",
    city: "Auckland",
    country: "New-Zealand",
    stars: 3,
    hasSpa: false,
    hasPool: true,
    priceCategory: 2,
  },
];

// ROUTES
router.get("/", (_req, res) => {
  res.json(hotels);
});

router.get("/:id", (req, res) => {
  const hotel = hotels.find((host) => {
    return host.id.toString() === req.params.id;
  });

  res.json(hotel);
});

router.post("/", validateSchema, (req, res) => {
  hotels.push({
    id: hotels.length + 1,
    name: req.body.name,
    address: req.body.address,
    city: req.body.city,
    country: req.body.country,
    stars: req.body.stars,
    hasSpa: req.body.hasSpa,
    hasPool: req.body.hasPool,
    priceCategory: req.body.priceCategory,
  });

  res.json({
    message: "Ajout de l'hôtel " + req.body.name,
    hotels: hotels,
  });
});

router.patch("/:id", (req, res) => {
  const hotel = hotels.find((host) => {
    return host.id.toString() === req.params.id;
  });
  hotel.name = req.body.name;
  res.json({
    message: "Mise à jour de l'hôtel n°" + req.params.id,
    hotels: hotels,
  });
});

router.delete("/:id", (req, res) => {
  const hotel = hotels.find((host) => {
    return host.id.toString() === req.params.id;
  });

  const index = hotels.indexOf(hotel);
  hotels.splice(index, 1);

  res.json({
    message: "L'hôtel n°" + req.params.id + " a été supprimé",
    hotels: hotels,
  });
});

// On exporte le router
module.exports = router;