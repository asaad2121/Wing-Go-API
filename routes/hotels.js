const express = require('express');
const router = express.Router();
const { getHotelData, getTopHotelsData, getHotelsByCity, getHotelsForTopCities } = require('../services/hotels');

router.get('/getHotelData', getHotelData);

router.get('/getTopHotels', getTopHotelsData);

router.get('/getHotelsByCity', getHotelsByCity);

router.get('/getHotelsForTopCities', getHotelsForTopCities);

module.exports = router;
