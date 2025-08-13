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
                where: { is_active: true },
                required: false,
                as: 'images',
            },
        ],
    });
    if (!hotel) return res.status(401).json({ success: false, message: 'Hotel not found. Try again later!' });
    res.status(200).json({ success: true, message: 'Hotel data', data: hotel });
};

const getTopHotelsData = async (req, res) => {
    // Top hotels - filtered by rating
    const limit = Number(req.query.limit) ?? 5;
    const imagesLimit = Number(req.query.imagesLimit) ?? 1;
    console.log(limit, imagesLimit, req.query);

    const hotelsData = await models.Hotels.findAll({
        where: {
            rating: { [Op.between]: [3, 5] },
        },
        limit,
        include: [
            {
                model: models.HotelImages,
                as: 'images',
                where: { is_active: true },
                required: false,
                limit: imagesLimit,
            },
        ],
    });
    if (!hotelsData) return res.status(401).json({ success: false, message: 'No hotels found. Try again later!' });
    res.status(200).json({ success: true, message: 'Top Hotels data', data: hotelsData });
};

const getHotelsByCity = async (req, res) => {
    // Filter by rating
    const cityID = req.body.city;
    const limit = req.body.limit ?? 5;
    const imagesLimit = req.body.imagesLimit ?? 1;
    try {
        if (!cityID) return res.status(401).json({ success: false, message: 'Hotel city not found. Try again later!' });
        const hotel = await models.Hotels.findAll({
            where: { city: cityID },
            limit,
            include: [
                {
                    model: models.HotelImages,
                    as: 'images',
                    where: { is_active: true },
                    required: false,
                    limit: imagesLimit,
                },
            ],
        });
        if (!hotel)
            return res.status(401).json({ success: false, message: 'Hotels in this city not found. Try again later!' });
        res.status(200).json({ success: true, message: 'Hotel data', data: hotel });
    } catch (error) {
        console.error('Error fetching hotels for hotels by city:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const getHotelsForTopCities = async (req, res) => {
    const limit = req.body.limit ?? 5;
    const imagesLimit = req.body.imagesLimit ?? 1;

    try {
        const topCities = await models.City.findAll({
            where: { top_city: 1 },
            attributes: ['id', 'name'],
        });

        if (!topCities || topCities?.length === 0)
            return res.status(404).json({ success: false, message: 'No top cities found.' });

        const result = {};
        for (const city of topCities) {
            const hotels = await models.Hotels.findAll({
                where: {
                    cityId: city.id,
                    rating: { [Op.between]: [3.5, 5] },
                },
                limit,
                include: [
                    {
                        model: models.HotelImages,
                        as: 'images',
                        where: { is_active: true },
                        required: false,
                        limit: imagesLimit,
                    },
                ],
            });
            result[city.name] = hotels;
        }

        res.status(200).json({
            success: true,
            message: 'Hotels for top cities',
            data: result,
        });
    } catch (error) {
        console.error('Error fetching hotels for top cities:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = {
    getHotelData,
    getTopHotelsData,
    getHotelsByCity,
    getHotelsForTopCities,
};
