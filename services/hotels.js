const models = require('../models');
const { Op } = require('sequelize');

const getHotelData = async (req, res) => {
    // Single Hotel data
    const { id } = req.body;
    if (!id) return res.status(401).json({ success: false, message: 'Hotel ID not found. Try again later!' });
    const hotel = await models.Hotels.findOne({
        where: { id: id },
        include: [
            {
                model: models.HotelImages,
                as: 'images',
            },
        ],
    });
    if (!hotel) return res.status(401).json({ success: false, message: 'Hotel not found. Try again later!' });
    res.status(200).json({ success: true, message: 'Hotel data', data: hotel });
};

const getTopHotelsData = async (req, res) => {
    // Top hotels - filtered by rating
    const limit = req.body.limit ?? 5;
    const imagesLimit = req.body.imagesLimit ?? 1;

    const hotelsData = await models.Hotels.findAll({
        where: {
            rating: { [Op.between]: [3, 5] },
        },
        limit,
        include: [
            {
                model: models.HotelImages,
                as: 'images',
                limit: imagesLimit,
            },
        ],
    });
    if (!hotelsData) return res.status(401).json({ success: false, message: 'No hotels found. Try again later!' });
    res.status(200).json({ success: true, message: 'Top Hotels data', data: hotelsData });
};

const getHotelsByCity = async (req, res) => {
    // Filter by rating
    const city = req.body.city;
    const limit = req.body.limit ?? 5;
    const imagesLimit = req.body.imagesLimit ?? 1;
    if (!city) return res.status(401).json({ success: false, message: 'Hotel city not found. Try again later!' });
    const hotel = await models.Hotels.findAll({
        where: { city: city },
        limit,
        include: [
            {
                model: models.HotelImages,
                as: 'images',
                limit: imagesLimit,
            },
        ],
    });
    if (!hotel)
        return res.status(401).json({ success: false, message: 'Hotels in this city not found. Try again later!' });
    res.status(200).json({ success: true, message: 'Hotel data', data: hotel });
};

module.exports = {
    getHotelData,
    getTopHotelsData,
    getHotelsByCity,
};
