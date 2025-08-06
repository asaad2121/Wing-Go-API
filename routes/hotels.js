const express = require('express');
const router = express.Router();
const { getHotelData, getTopHotelsData, getHotelsByCity } = require('../services/hotels');

router.get('/getHotelData', getHotelData);

router.get('/getTopHotels', getTopHotelsData);

router.get('/getHotelsByCity', getHotelsByCity);

module.exports = router;
