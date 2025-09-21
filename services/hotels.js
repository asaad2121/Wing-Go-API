const models = require('../models');
const { Op } = require('sequelize');

const getHotelData = async (req, res) => {
    // Single Hotel data
    const id = parseInt(req.query.id);
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
    const limit = parseInt(req.query.limit) || 5;
    const imagesLimit = parseInt(req.query.imagesLimit) || 1;

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
    const cityId = parseInt(req.query.cityId, 10);
    const limit = parseInt(req.query.limit, 10) || 5;
    const imagesLimit = parseInt(req.query.imagesLimit, 10) || 1;
    try {
        if (!cityId) return res.status(401).json({ success: false, message: 'Hotel city not found. Try again later!' });
        const hotel = await models.Hotels.findAll({
            where: {
                rating: { [Op.between]: [3, 5] },
                cityId: cityId,
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
                {
                    model: models.City,
                    as: 'city',
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
    const limit = parseInt(req.query.limit) || 5;
    const imagesLimit = parseInt(req.query.imagesLimit) || 1;

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

const getFilteredHotels = async (req, res) => {
    const cityIds = req.query.cityIds;
    const limit = parseInt(req.query.limit) || 10;
    const currentPageNo = parseInt(req.query.currentPageNo) || 1;
    const imagesLimit = parseInt(req.query.imagesLimit) || 1;
    const rating = req.query.rating;
    const priceRange = req.query.priceRange;

    try {
        let whereClause = {};
        let order = [];

        if (rating) {
            if (Array.isArray(rating) && rating.length === 2) {
                whereClause.rating = { [Op.between]: rating.map((r) => parseFloat(r)) };
            } else {
                whereClause.rating = parseFloat(rating);
            }
        }

        if (Array.isArray(priceRange) && priceRange.length === 2) {
            whereClause.pricePerNight = {
                [Op.between]: priceRange.map((p) => parseFloat(p)),
            };
        }

        if (Array.isArray(cityIds) && cityIds.length > 0) {
            whereClause.cityId = { [Op.in]: cityIds.map((id) => parseInt(id, 10)) };
        } else {
            order.push(['name', 'ASC']);
        }

        const offset = (currentPageNo - 1) * limit;

        const { count, rows } = await models.Hotels.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order,
            include: [
                {
                    model: models.HotelImages,
                    as: 'images',
                    where: { is_active: true },
                    required: false,
                    limit: imagesLimit,
                },
                {
                    model: models.City,
                    as: 'city',
                    attributes: ['id', 'name'],
                },
            ],
        });

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hotels found. Try again later!',
            });
        }

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            success: true,
            message: cityIds?.length ? `Hotels for cities: ${cityIds.join(',')}` : 'All hotels in alphabetical order',
            pagination: {
                limit,
                currentPageNo,
                totalPages,
                totalResults: count,
            },
            data: rows,
        });
    } catch (error) {
        console.error('Error fetching filtered hotels:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports = {
    getHotelData,
    getTopHotelsData,
    getHotelsByCity,
    getHotelsForTopCities,
    getFilteredHotels,
};
