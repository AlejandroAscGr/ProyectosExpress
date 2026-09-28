// Aqui importamos parejito todo lo que venia en index.js
// Express
var express = require('express');
const router = express.Router();
//Validator
const { body, validationResult } = require('express-validator');
// Database
const db = require('../database/db');





// aqui van las rutas
module.exports = router;