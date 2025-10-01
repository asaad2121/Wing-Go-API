const models = require('../models');
const { Op } = require('sequelize');

// Haversine formula (distance in km)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const planTouristTrip = async (req, res) => {
    const { tripData } = req.body;

    if (!Array.isArray(tripData) || tripData.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid trip data' });
    }

    try {
        const results = [];

        for (const segment of tripData) {
            const { cityId, cityName, days, budget, touristDestinationIds } = segment;
            const perDayBudget = budget / days;

            const hotels = await models.Hotels.findAll({
                where: {
                    cityId,
                    pricePerNight: { [Op.lte]: perDayBudget },
                },
                include: [
                    {
                        model: models.HotelImages,
                        as: 'images',
                        where: { is_active: true },
                        required: false,
                        limit: 1,
                    },
                ],
                order: [['rating', 'DESC']],
                limit: 20,
            });

            let sortedHotels = hotels.map((h) => h.toJSON());

            if (touristDestinationIds?.length > 0) {
                const touristPlaces = await models.TouristPlace.findAll({
                    where: { id: { [Op.in]: touristDestinationIds } },
                });

                sortedHotels = sortedHotels.map((hotel) => {
                    const avgDistance =
                        Math.ceil(
                            (touristPlaces.reduce((sum, tp) => {
                                return (
                                    sum +
                                    haversineDistance(
                                        parseFloat(hotel.latitude),
                                        parseFloat(hotel.longitude),
                                        parseFloat(tp.latitude),
                                        parseFloat(tp.longitude)
                                    )
                                );
                            }, 0) /
                                touristPlaces.length) *
                                100
                        ) / 100;

                    return { ...hotel, avgDistance };
                });

                sortedHotels.sort((a, b) => a.avgDistance - b.avgDistance);
            }

            results.push({
                cityId,
                cityName,
                days,
                budget,
                perDayBudget,
                hotels: sortedHotels,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Trip plan generated successfully',
            data: results,
        });
    } catch (error) {
        console.error('Error planning trip:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

const tripHotelsSelect = async (req, res) => {
    const { userId, tripData, selectedHotels } = req.body;

    if (tripData.length !== selectedHotels.length) {
        return res.status(400).json({
            success: false,
            message: 'Trip data and selected hotels must have the same length',
        });
    }

    const t = await models.sequelize.transaction();

    try {
        const trip = await models.Trips.create({ user_id: userId }, { transaction: t });

        const userTripHotelsPayload = tripData.map((segment, index) => ({
            trip_id: trip.id,
            city_id: segment.cityId,
            city_name: segment.cityName,
            days: segment.days,
            budget: segment.budget,
            tourist_destination_ids: segment.touristDestinationIds || [],
            hotel_id: selectedHotels[index],
        }));

        await models.UserTripHotels.bulkCreate(userTripHotelsPayload, { transaction: t });

        await t.commit();

        return res.status(201).json({
            success: true,
            message: 'Trip and hotel selections saved successfully',
            tripId: trip.id,
        });
    } catch (err) {
        await t.rollback();
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Failed to save trip',
            error: err.message,
        });
    }
};

module.exports = { planTouristTrip, tripHotelsSelect };
