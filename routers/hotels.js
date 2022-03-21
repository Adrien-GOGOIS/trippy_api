const express = require("express");
const req = require("express/lib/request");
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

const commentSchema = Joi.object({
  username: Joi.string().min(1).max(50).required(),
  text: Joi.string().min(5).max(200).required(),
});

// Tableau des hôtels :
// const hotels = [
//   {
//     id: "1",
//     name: "Imperial Hotel",
//     address: "84 av des Champs-Élysées",
//     city: "Paris",
//     country: "France",
//     stars: 5,
//     hasSpa: true,
//     hasPool: true,
//     priceCategory: 3,
//     comments: [
//       {
//         commentId: "1",
//         username: "Jacky",
//         text: "Very good hotel despite the fact that there is no toilet (had to go in the forest)",
//       },
//       {
//         commentId: "2",
//         username: "Jacky",
//         text: "Very good hotel despite the fact that there is no toilet (had to go in the forest)",
//       },
//       {
//         commentId: "3",
//         username: "Jacky",
//         text: "Very good hotel despite the fact that there is no toilet (had to go in the forest)",
//       },
//       {
//         commentId: "4",
//         username: "Jacky",
//         text: "Very good hotel despite the fact that there is no toilet (had to go in the forest)",
//       },
//       {
//         commentId: "5",
//         username: "Jacky",
//         text: "Very good hotel despite the fact that there is no toilet (had to go in the forest)",
//       },
//     ],
//   },
//   {
//     id: "2",
//     name: "The Queen",
//     address: "3 Darwin Street",
//     city: "London",
//     country: "England",
//     stars: 4,
//     hasSpa: true,
//     hasPool: false,
//     priceCategory: 3,
//     comments: [{}],
//   },
//   {
//     id: "3",
//     name: "Kiwi land",
//     address: "4587 George St.",
//     city: "Auckland",
//     country: "New-Zealand",
//     stars: 3,
//     hasSpa: false,
//     hasPool: true,
//     priceCategory: 2,
//     comments: [{}],
//   },
// ];

// ***** ROUTES ***** //

// GET

let hotel;

router.get("/", async (req, res) => {
  try {
    hotel = await Postgres.query("SELECT * FROM hotels");
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "An error happened",
    });
  }

  // On vérifie si on a des query :
  if (Object.keys(req.query).length === 0) {
    res.json(hotel.rows);
  }

  const queryKeys = Object.keys(req.query);

  // Stockage des hôtels dans un nouveau tableau
  let result = hotel.rows;

  // A chaque itération, on garde dans le tableau les hôtels correspondant au params[i] :
  for (i = 0; i < queryKeys.length; i++) {
    // GUARD pour params API_KEY
    if (queryKeys[i] === "api_key") {
      continue;
    } else {
      result = result.filter((hotel) => {
        let queryValue = hotel[queryKeys[i]];

        // GUARD si mauvaise entrée clef :
        if (queryValue === undefined) {
          res
            .status(500)
            .send(
              "Paramètre de recherche inconnu : " + queryKeys[i].toUpperCase()
            );
        }

        return (
          queryValue.toString().toLowerCase() ===
          req.query[queryKeys[i]].toString().toLowerCase()
        );
      });
    }
  }

  if (result.length === 0) {
    res.send("Désolé, aucun hôtel ne correspond à cette recherche");
  } else {
    res.json(result);
  }
});

router.get("/:id", async (req, res) => {
  try {
    hotel = await Postgres.query("SELECT * FROM hotels WHERE hotel_id=$1", [
      req.params.id,
    ]);
    res.json(hotel.rows);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "An error happened",
    });
  }

  // const copyHotel = { ...hotel };
  // copyHotel.comments = copyHotel.comments.slice(0, 3);
  // res.json(copyHotel);
});

router.get("/:id/comments/", (req, res) => {
  const hotel = hotels.find((host) => {
    return host.id.toString() === req.params.id;
  });

  res.json(hotel.comments);
});

router.get("/countries/:country", async (req, res) => {
  try {
    hotel = await Postgres.query(
      "SELECT * FROM hotels WHERE LOWER(country)=$1",
      [req.params.country.toLowerCase()]
    );
    res.json(hotel.rows);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "An error happened",
    });
  }
});

router.get("/prices/:price", async (req, res) => {
  try {
    hotel = await Postgres.query(
      "SELECT * FROM hotels WHERE priceCategory=$1",
      [req.params.price]
    );
    res.json(hotel.rows);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "An error happened",
    });
  }
});

router.get("/spa/pool", async (_req, res) => {
  hotel = await Postgres.query(
    "SELECT * FROM hotels WHERE hasPool=TRUE AND hasSpa=TRUE"
  );
  res.json(hotel.rows);
});

// POST
router.post("/", validateSchema, async (req, res) => {
  try {
    await Postgres.query(
      "INSERT INTO hotels(name, address, city, country, stars, hasSpa, hasPool, priceCategory) VALUES($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        req.body.name,
        req.body.address,
        req.body.city,
        req.body.country,
        req.body.stars,
        req.body.hasSpa,
        req.body.hasPool,
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
  const hotel = hotels.find((host) => {
    return host.id.toString() === req.params.id;
  });

  hotel.comments.push({
    commentId: uuidv4(),
    username: req.body.username,
    text: req.body.text,
  });

  res.json({
    message: "Ajout du commentaire de " + req.body.username,
    commentaire: hotel.comments,
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
