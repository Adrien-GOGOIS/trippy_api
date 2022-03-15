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
  } else {
    next();
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

router.get("/", (req, res) => {
  // On vérifie si on a des query :
  if (Object.keys(req.query).length !== 0) {
    const query = Object.keys(req.query);

    // Stockage des hôtels dans un nouveau tableau
    let result = hotels;

    // A chaque itération, on garde dans le tableau les hôtels correspondant au params[i] :
    for (i = 0; i < query.length; i++) {
      // GUARD pour params API_KEY
      if (query[i] === "api_key") {
        continue;
      } else {
        result = result.filter((hotel) => {
          let queryValue = hotel[query[i]];

          // GUARD si mauvaise entrée clef :
          if (queryValue === undefined) {
            res
              .status(500)
              .send(
                "Paramètre de recherche inconnu : " + query[i].toUpperCase()
              );
          }

          // Conversion des nb et booleen en string
          if (typeof queryValue === "boolean") {
            return (
              queryValue.toString().toLowerCase() ===
              req.query[query[i]].toString().toLowerCase()
            );
          } else if (typeof queryValue === "number") {
            return queryValue.toString() === req.query[query[i]].toString();
          } else {
            return (
              queryValue.toLowerCase() === req.query[query[i]].toLowerCase()
            );
          }
        });
      }
    }

    if (result.length === 0) {
      res.send("Désolé, aucun hôtel ne correspond à cette recherche");
    } else {
      res.json(result);
    }

    // Si pas de query, on affiche tous les hôtels :
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
  res.json(result);
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
