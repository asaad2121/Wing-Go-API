const models = require('../models');
const { Op } = require('sequelize');

// Fetch detailed data for a single tourist place by ID, including active images
const getTouristPlaceData = async (req, res) => {
    // Extract and validate tourist place ID from query
    const id = parseInt(req.query?.id);
    if (!id) return res.status(401).json({ success: false, message: 'Tourist place ID not found. Try again later!' });

    // Query for tourist place with associated active images
    const tourist_place = await models.TouristPlace.findOne({
        where: { id: id },
        include: [
            {
                model: models.TouristPlaceImages,
                where: { is_active: true },
                required: false,
                as: 'images',
            },
        ],
    });

    if (!tourist_place)
        return res.status(401).json({ success: false, message: 'Tourist place not found. Try again later!' });

    res.status(200).json({ success: true, message: 'Tourist place data', data: tourist_place });
};

// Retrieve tourist places filtered by city ID with optional limits on results and images
const getTouristPlacesByCity = async (req, res) => {
    // Extract query params: cityId (required), limit, imagesLimit
    const cityId = req.query.cityId;
    const limit = parseInt(req.query.limit) || 5;
    const imagesLimit = parseInt(req.query.imagesLimit) || 1;

    if (!cityId) {
        return res.status(401).json({ success: false, message: 'Tourist place cityId not found. Try again later!' });
    }

    // Query tourist places for the city, include limited active images and city info
    const touristPlaces = await models.TouristPlace.findAll({
        where: { cityId: cityId },
        limit,
        include: [
            {
                model: models.TouristPlaceImages,
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

    if (!touristPlaces || touristPlaces.length === 0) {
        return res
            .status(401)
            .json({ success: false, message: 'Tourist places in this city not found. Try again later!' });
    }

    res.status(200).json({ success: true, message: 'Tourist Places data', data: touristPlaces });
};

// Fetch tourist places grouped by top cities, each with limited places and images
const getTouristPlacesForTopCities = async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const imagesLimit = parseInt(req.query.imagesLimit) || 1;

    try {
        // Find cities marked as top_city
        const topCities = await models.City.findAll({
            where: { top_city: 1 },
            attributes: ['id', 'name'],
        });

        if (!topCities || topCities?.length === 0)
            return res.status(404).json({ success: false, message: 'No top cities found.' });

        // For each top city, fetch limited tourist places with limited active images
        const result = {};
        for (const city of topCities) {
            const touristPlaces = await models.TouristPlace.findAll({
                where: {
                    cityId: city.id,
                },
                limit,
                include: [
                    {
                        model: models.TouristPlaceImages,
                        as: 'images',
                        where: { is_active: true },
                        required: false,
                        limit: imagesLimit,
                    },
                ],
            });
            result[city.name] = touristPlaces;
        }

        res.status(200).json({
            success: true,
            message: 'Tourist places for top cities',
            data: result,
        });
    } catch (error) {
        console.error('Error fetching Tourist places for top cities:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Retrieve filtered tourist places with pagination, optional city filtering, and image limits
const getFilteredTouristPlaces = async (req, res) => {
    const cityIds = req.query.cityIds;
    const limit = parseInt(req.query.limit) || 10;
    const currentPageNo = parseInt(req.query.currentPageNo) || 1;
    const imagesLimit = parseInt(req.query.imagesLimit) || 1;

    try {
        let whereClause = {};
        let order = [];

        // If cityIds provided, filter places by those city IDs
        if (Array.isArray(cityIds) && cityIds.length > 0) {
            whereClause.cityId = { [Op.in]: cityIds.map((id) => parseInt(id)) };
        } else {
            // No city filter: order alphabetically by name
            order.push(['name', 'ASC']);
        }

        // Calculate offset for pagination
        const offset = (currentPageNo - 1) * limit;

        // Query with filters, pagination, and include active images and city info
        const { count, rows } = await models.TouristPlace.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order,
            include: [
                {
                    model: models.TouristPlaceImages,
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
                message: 'No tourist places found. Try again later!',
            });
        }

        // Calculate total pages for pagination metadata
        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            success: true,
            message: cityIds?.length
                ? `Tourist places for cities: ${cityIds.join(',')}`
                : 'All tourist places in alphabetical order',
            pagination: {
                limit,
                currentPageNo,
                totalPages,
                totalResults: count,
            },
            data: rows,
        });
    } catch (error) {
        console.error('Error fetching filtered tourist places:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports = {
    getTouristPlaceData,
    getTouristPlacesByCity,
    getTouristPlacesForTopCities,
    getFilteredTouristPlaces,
};
