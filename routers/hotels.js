const { query } = require("express");
const express = require("express");
const req = require("express/lib/request");
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
  name: Joi.string().min(1).max(50).required(),
  address: Joi.string().max(50).required(),
  city: Joi.string().max(50).required(),
  country: Joi.string().max(50).required(),
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

// ***** ROUTES ***** //

// GET
router.get("/", (_req, res) => {
  res.json(hotels);
});

router.get("/all", (req, res) => {
  if (Object.keys(req.query).length !== 0) {
    const key = Object.keys(req.query)[0];
    const value = req.query[key];

    const hotel = hotels.find((host) => {
      return host[key].toLowerCase() === value.toLowerCase();
    });

    res.json(hotel);
  } else {
    res.json(hotels);
  }
});

router.get("/:id", (req, res) => {
  const hotel = hotels.find((host) => {
    return host.id.toString() === req.params.id;
  });

  res.json(hotel);
});

router.get("/countries/:country", (req, res) => {
  const hotel = hotels.find((host) => {
    return host.country.toLowerCase() === req.params.country.toLowerCase();
  });
  res.json(hotel);
});

router.get("/prices/:price", (req, res) => {
  const hotel = hotels.find((host) => {
    return host.priceCategory.toString() === req.params.price;
  });
  res.json(hotel);
});

router.get("/spa/pool", (_req, res) => {
  const result = [];
  for (let i = 0; i < hotels.length; i++) {
    if (hotels[i].hasPool === true || hotels[i].hasSpa === true) {
      result.push(hotels[i]);
    }
  }
  res.json(hotels);
});

// POST
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

// PATCH
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

// DELETE
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
