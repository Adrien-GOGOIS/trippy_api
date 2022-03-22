const express = require("express");
const router = express.Router();

const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});

const { Pool } = require("pg");

const app = express();

const Postgres = new Pool({ ssl: { rejectUnauthorized: false } });

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
// const restaurants = [
//   {
//     id: "1",
//     name: "Les trois Mousquetaires",
//     address: "22 av des Champs-Élysées",
//     city: "Paris",
//     country: "France",
//     stars: 4,
//     cuisine: "french",
//     priceCategory: 3,
//     comments: [
//       {
//         commentId: "1",
//         username: "Jacky",
//         text: "Very good restaurant despite the fact that there is no food (had to pick fungus in the forest)",
//       },
//     ],
//   },
//   {
//     id: "2",
//     name: "The Fat Guy",
//     address: "47 Jackson Boulevard",
//     city: "New York",
//     country: "US",
//     stars: 5,
//     cuisine: "burger",
//     priceCategory: 1,
//     comments: [{}],
//   },
//   {
//     id: "3",
//     name: "Veggies",
//     address: "77 Avenir Street",
//     city: "Sydney",
//     country: "Australia",
//     stars: 5,
//     cuisine: "vegan",
//     priceCategory: 2,
//     comments: [{}],
//   },
// ];

let restaurant;

// ***** ROUTES ***** //

// GET
router.get("/", async (req, res) => {
  const queryKeys = Object.keys(req.query);
  const dataBaseInstruction = "SELECT * FROM restaurants";
  let dataBaseInstruction2 =
    dataBaseInstruction +
    " WHERE " +
    queryKeys[0] +
    "='" +
    req.query[queryKeys[0]].toString().toLowerCase() +
    "'";

  try {
    if (Object.keys(req.query).length === 0) {
      restaurant = await Postgres.query(dataBaseInstruction);
    } else if (Object.keys(req.query).length === 1) {
      restaurant = await Postgres.query(dataBaseInstruction2);
    } else {
      for (i = 1; i < queryKeys.length; i++) {
        dataBaseInstruction2 =
          dataBaseInstruction2 +
          " AND " +
          queryKeys[i] +
          "='" +
          req.query[queryKeys[i]].toString().toLowerCase() +
          "'";
      }
      restaurant = await Postgres.query(dataBaseInstruction2);
    }

    if (restaurant.rows.length === 0) {
      return res.send("Désolé, aucun hôtel ne correspond à cette recherche");
    }

    res.json(restaurant.rows);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "An error happened",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    restaurant = await Postgres.query(
      "SELECT * FROM restaurants WHERE restaurant_id=$1",
      [req.params.id]
    );
    res.json(restaurant.rows);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "An error happened",
    });
  }

  // const copyrestaurant = { ...restaurant };
  // copyrestaurant.comments = copyrestaurant.comments.slice(0, 3);
  // res.json(copyrestaurant);
});

router.get("/:id/comments/", (req, res) => {
  const restaurant = restaurants.find((host) => {
    return host.id.toString() === req.params.id;
  });

  res.json(restaurant.comments);
});

router.get("/countries/:country", async (req, res) => {
  try {
    restaurant = await Postgres.query(
      "SELECT * FROM restaurants WHERE LOWER(country)=$1",
      [req.params.country.toLowerCase()]
    );
    res.json(restaurant.rows);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "An error happened",
    });
  }
});

router.get("/prices/:price", async (req, res) => {
  try {
    restaurant = await Postgres.query(
      "SELECT * FROM restaurants WHERE priceCategory=$1",
      [req.params.price]
    );
    res.json(restaurant.rows);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "An error happened",
    });
  }
});

// POST
router.post("/", validateSchema, async (req, res) => {
  try {
    await Postgres.query(
      "INSERT INTO restaurants(name, address, city, country, stars, hasSpa, hasPool, priceCategory) VALUES($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        req.body.name,
        req.body.address,
        req.body.city,
        req.body.country,
        req.body.stars,
        req.body.cuisine,
        req.body.priceCategory,
      ]
    );
    res.json({
      message: "Ajout de l'hôtel " + req.body.name,
    });
  } catch (err) {
    res.status(400).json({
      message: "An error happened",
    });
  }

  res.json({
    message: "Ajout de l'hôtel " + req.body.name,
  });
});

router.post("/:id/comments/", validateComment, (req, res) => {
  const restaurant = restaurants.find((host) => {
    return host.id.toString() === req.params.id;
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
router.patch("/:id", async (req, res) => {
  try {
    restaurant = await Postgres.query(
      "UPDATE restaurants SET name=$1 WHERE restaurant_id=$2",
      [req.body.name, req.params.id]
    );
    res.json({
      description: "Mise à jour de l'hôtel n°" + req.params.id,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "An error happened",
    });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    restaurant = await Postgres.query(
      "DELETE FROM restaurants WHERE restaurant_id=$1",
      [req.params.id]
    );
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "An error happened",
    });
  }

  res.json({
    message: "L'hôtel n°" + req.params.id + " a été supprimé",
  });
});

// On exporte le router
module.exports = router;
