const models = require('../models');
const { Op } = require('sequelize');

const getTouristPlaceData = async (req, res) => {
    // Single Tourist place data
    const id = parseInt(req.query?.id);
    if (!id) return res.status(401).json({ success: false, message: 'Tourist place ID not found. Try again later!' });
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

const getTouristPlacesByCity = async (req, res) => {
    // Filter tourist places by city
    const cityId = req.query.cityId;
    const limit = parseInt(req.query.limit) || 5;
    const imagesLimit = parseInt(req.query.imagesLimit) || 1;

    if (!cityId) {
        return res.status(401).json({ success: false, message: 'Tourist place cityId not found. Try again later!' });
    }

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

const getTouristPlacesForTopCities = async (req, res) => {
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

const getFilteredTouristPlaces = async (req, res) => {
    const cityIds = req.query.cityIds;
    const limit = parseInt(req.query.limit) || 10;
    const currentPageNo = parseInt(req.query.currentPageNo) || 1;
    const imagesLimit = parseInt(req.query.imagesLimit) || 1;

    try {
        let whereClause = {};
        let order = [];

        if (Array.isArray(cityIds) && cityIds.length > 0) {
            whereClause.cityId = { [Op.in]: cityIds.map((id) => parseInt(id)) };
        } else {
            order.push(['name', 'ASC']); // fallback: alphabetical if no cityIds
        }

        const offset = (currentPageNo - 1) * limit;

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
