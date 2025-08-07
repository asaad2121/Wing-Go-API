const express = require('express');
const router = express.Router();
const { getTouristPlaceData, getTouristPlacesByCity } = require('../services/tourist-place');

router.get('/getTouristPlaceData', getTouristPlaceData);

router.get('/getTouristPlacesByCity', getTouristPlacesByCity);

module.exports = router;
