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
  } else {
    next();
  }
}

function validateComment(req, res, next) {
  const validationResult = commentSchema.validate(req.body);

  if (validationResult.error) {
    return res.status(400).json({
      message: validationResult.error.details[0].message,
      description: "Format non valide",
    });
  } else {
    next();
  }
}

// Librairies
const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");

const restaurantsSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  adress: Joi.string().max(50).required(),
  city: Joi.string().max(50).required(),
  country: Joi.string().max(50).required(),
  stars: Joi.number().min(1).max(5).required(),
  cuisine: Joi.string().required(),
  priceCategory: Joi.number().min(1).max(3).required(),
});

const commentSchema = Joi.object({
  username: Joi.string().min(1).max(50).required(),
  text: Joi.string().min(5).max(200).required(),
});

// Tableau des restaurants :
const restaurants = [
  {
    id: "1",
    name: "Les trois Mousquetaires",
    address: "22 av des Champs-Élysées",
    city: "Paris",
    country: "France",
    stars: 4,
    cuisine: "french",
    priceCategory: 3,
    comments: [
      {
        commentId: "1",
        username: "Jacky",
        text: "Very good restaurant despite the fact that there is no food (had to pick fungus in the forest)",
      },
    ],
  },
  {
    id: "2",
    name: "The Fat Guy",
    address: "47 Jackson Boulevard",
    city: "New York",
    country: "US",
    stars: 5,
    cuisine: "burger",
    priceCategory: 1,
    comments: [{}],
  },
  {
    id: "3",
    name: "Veggies",
    address: "77 Avenir Street",
    city: "Sydney",
    country: "Australia",
    stars: 5,
    cuisine: "vegan",
    priceCategory: 2,
    comments: [{}],
  },
];

// ***** ROUTES ***** //

// GET
router.get("/", (req, res) => {
  // On vérifie si on a des query :
  if (Object.keys(req.query).length !== 0) {
    const query = Object.keys(req.query);

    // Stockage des restaurants dans un nouveau tableau
    let result = restaurants;

    // A chaque itération, on enlève du tableau les restaurants ne correspondant pas à la recherche :
    for (i = 0; i < query.length; i++) {
      // GUARD pour params API_KEY
      if (query[i] === "api_key") {
        continue;
      } else {
        result = result.filter((restaurant) => {
          let queryValue = restaurant[query[i]];

          // Guard si mauvaise entrée clef :
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
            return queryValue.toLowerCase() === req.query[query[i]];
          }
        });
      }
    }

    if (result.length === 0) {
      res.send("Désolé, aucun restaurant ne correspond à cette recherche");
    } else {
      // On garde que les 3 premiers commentaires pour chaque hôtel
      const copyRestaurant = { ...result };
      copyRestaurant.map((item) => {
        return item.comments.slice(0, 3);
      });
      res.json(copyRestaurant);
    }

    // Si pas de query, on affiche tous les restaurants :
  } else {
    // On garde que les 3 premiers commentaires pour chaque hôtel
    const copyRestaurant = { ...restaurants };
    copyRestaurant.map((item) => {
      return item.comments.slice(0, 3);
    });
    res.json(copyRestaurant);
  }
});

router.get("/:id", (req, res) => {
  const restaurant = restaurants.find((rest) => {
    return rest.id.toString() === req.params.id;
  });

  const copyRestaurant = { ...restaurant };
  copyRestaurant.comments = copyRestaurant.comments.slice(0, 3);
  res.json(copyRestaurant);
});

router.get("/:id/comments/", (req, res) => {
  const restaurant = restaurants.find((rest) => {
    return rest.id.toString() === req.params.id;
  });

  res.json(restaurant.comments);
});

router.get("/countries/:country", (req, res) => {
  const restaurant = restaurants.find((rest) => {
    return rest.country.toLowerCase() === req.params.country.toLowerCase();
  });
  res.json(restaurant);
});

router.get("/prices/:price", (req, res) => {
  const restaurant = restaurants.find((rest) => {
    return rest.priceCategory.toString() === req.params.price;
  });
  res.json(restaurant);
});

// POST
router.post("/", validateSchema, (req, res) => {
  restaurants.push({
    id: uuidv4(),
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

router.post("/:id/comments/", validateComment, (req, res) => {
  const restaurant = restaurants.find((rest) => {
    return rest.id.toString() === req.params.id;
  });

  restaurant.comments.push({
    commentId: uuidv4(),
    username: req.body.username,
    text: req.body.text,
  });

  res.json({
    message: "Ajout du commentaire de " + req.body.username,
    commentaire: restaurant.comments,
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
