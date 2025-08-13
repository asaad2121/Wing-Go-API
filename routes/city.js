const express = require('express');
const router = express.Router();
const { getAllCities, getTopCities } = require('../services/city');

router.get('/getAllCities', getAllCities);
router.get('/getTopCities', getTopCities);

module.exports = router;
