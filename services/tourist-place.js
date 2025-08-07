const models = require('../models');
const { Op } = require('sequelize');

const getTouristPlaceData = async (req, res) => {
    // Single Tourist place data
    const { id } = req.body;
    if (!id) return res.status(401).json({ success: false, message: 'Tourist place ID not found. Try again later!' });
    const tourist_place = await models.TouristPlace.findOne({
        where: { id: id },
        include: [
            {
                model: models.TouristPlaceImages,
                as: 'images',
            },
        ],
    });
    if (!tourist_place) return res.status(401).json({ success: false, message: 'Tourist place not found. Try again later!' });
    res.status(200).json({ success: true, message: 'Tourist place data', data: tourist_place });
};

const getTouristPlacesByCity = async (req, res) => {
    // Filter tourist places by city
    const city = req.body.city;
    const limit = req.body.limit ?? 5;
    const imagesLimit = req.body.imagesLimit ?? 1;

    if (!city) {
        return res.status(401).json({ success: false, message: 'Tourist place city not found. Try again later!' });
    }

    const touristPlaces = await models.TouristPlace.findAll({
        where: { city: city },
        limit,
        include: [
            {
                model: models.TouristPlaceImages,
                as: 'images',
                limit: imagesLimit,
            },
        ],
    });

    if (!touristPlaces || touristPlaces.length === 0) {
        return res.status(401).json({ success: false, message: 'Tourist places in this city not found. Try again later!' });
    }

    res.status(200).json({ success: true, message: 'Tourist Places data', data: touristPlaces });
};

module.exports = {
    getTouristPlaceData,
    getTouristPlacesByCity,
};
