const express = require("express");
const app = express();
const router = express.Router();

// Middleware
app.use(express.json());

app.use((_req, _res, next) => {
  console.log("requête reçu");
  next();
});

// JOI
const Joi = require("joi");

const hostelsSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  adress: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string(),
  stars: Joi.number().min(1).max(5).required(),
  hasSpa: Joi.boolean().required(),
  hasPool: Joi.boolean().required(),
  priceCategory: Joi.number().min(1).max(3).required(),
});

// Schéma JOI :

// Tableau des hôtels :
const hostels = [
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
