const models = require('../models');

const getAllCities = async (req, res) => {
    const cities = await models.City.findAll();
    if (!cities) return res.status(401).json({ success: false, message: 'No cities found. Try again later!' });
    res.status(200).json({ success: true, message: 'City data', data: cities });
};

const getTopCities = async (req, res) => {
    const cities = await models.City.findAll({
        where: { top_city: true },
    });
    if (!cities) return res.status(401).json({ success: false, message: 'No cities found. Try again later!' });
    res.status(200).json({ success: true, message: 'Top City data', data: cities });
};

module.exports = {
    getAllCities,
    getTopCities,
};
