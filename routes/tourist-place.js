const express = require('express');
const router = express.Router();
const {
    getTouristPlaceData,
    getTouristPlacesByCity,
    getTouristPlacesForTopCities,
    getFilteredTouristPlaces,
} = require('../services/tourist-place');

router.get('/getTouristPlaceData', getTouristPlaceData);

router.get('/getTouristPlacesByCity', getTouristPlacesByCity);

router.get('/getTouristPlacesForTopCities', getTouristPlacesForTopCities);

router.get('/getFilteredTouristPlaces', getFilteredTouristPlaces);

module.exports = router;
