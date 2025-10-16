const models = require('../models');
const { Op } = require('sequelize');

// Retrieves detailed data for a single hotel by ID, including active images
const getHotelData = async (req, res) => {
    // Extract hotel ID from query parameters
    const id = parseInt(req.query.id);
    if (!id) return res.status(401).json({ success: false, message: 'Hotel ID not found. Try again later!' });

    // Query hotel with associated active images
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

// Retrieves top-rated hotels filtered by rating range, limited number of results and images per hotel
const getTopHotelsData = async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const imagesLimit = parseInt(req.query.imagesLimit) || 1;

    // Find hotels with rating between 3 and 5, include limited active images
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

// Retrieves hotels filtered by city ID and rating, supports limiting results and images per hotel
const getHotelsByCity = async (req, res) => {
    const cityId = parseInt(req.query.cityId, 10);
    const limit = parseInt(req.query.limit, 10) || 5;
    const imagesLimit = parseInt(req.query.imagesLimit, 10) || 1;
    try {
        if (!cityId) return res.status(401).json({ success: false, message: 'Hotel city not found. Try again later!' });

        // Query hotels in the specified city with rating filter and include city info and active images
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

// Retrieves hotels for all top cities, each city's hotels filtered by rating and limited in number and images
const getHotelsForTopCities = async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const imagesLimit = parseInt(req.query.imagesLimit) || 1;

    try {
        // Fetch cities marked as top cities
        const topCities = await models.City.findAll({
            where: { top_city: 1 },
            attributes: ['id', 'name'],
        });

        if (!topCities || topCities?.length === 0)
            return res.status(404).json({ success: false, message: 'No top cities found.' });

        const result = {};
        // For each top city, fetch hotels with rating filter and include active images
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

// Retrieves hotels filtered by optional city IDs, rating, price range; supports pagination and sorting
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

        // Apply rating filter if provided (range or single value)
        if (rating) {
            if (Array.isArray(rating) && rating.length === 2) {
                whereClause.rating = { [Op.between]: rating.map((r) => parseFloat(r)) };
            } else {
                whereClause.rating = parseFloat(rating);
            }
        }

        // Apply price range filter if provided
        if (Array.isArray(priceRange) && priceRange.length === 2) {
            whereClause.pricePerNight = {
                [Op.between]: priceRange.map((p) => parseFloat(p)),
            };
        }

        // Filter by city IDs if provided, else order by hotel name ascending
        if (Array.isArray(cityIds) && cityIds.length > 0) {
            whereClause.cityId = { [Op.in]: cityIds.map((id) => parseInt(id, 10)) };
        } else {
            order.push(['name', 'ASC']);
        }

        const offset = (currentPageNo - 1) * limit;

        // Query hotels with filters, pagination, sorting, and include active images and city info
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
