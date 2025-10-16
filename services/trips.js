const models = require('../models');
const { Op } = require('sequelize');

// Haversine formula (distance in km) to calculate distance between two geo coordinates
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Plans a tourist trip by selecting suitable hotels per city segment based on budget and proximity to tourist destinations
const planTouristTrip = async (req, res) => {
    const { tripData } = req.body;

    // Validate input trip data array and length constraint
    if (!Array.isArray(tripData) || tripData.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid trip data' });
    }

    if (tripData.length > 4) {
        return res.status(400).json({ success: false, message: 'Trip too long!' });
    }

    try {
        const results = [];
        // Process each trip segment (city)
        for (const segment of tripData) {
            const { cityId, cityName, days, budget, touristDestinationIds } = segment;
            const perDayBudget = budget / days;

            // Fetch hotels within budget sorted by rating, including one active image if available
            const hotels = await models.Hotels.findAll({
                where: { cityId, pricePerNight: { [Op.lte]: perDayBudget } },
                include: [
                    { model: models.HotelImages, as: 'images', where: { is_active: true }, required: false, limit: 1 },
                ],
                order: [['rating', 'DESC']],
                limit: 20,
            });

            let sortedHotels = hotels.map((h) => h.toJSON());

            // If tourist destinations provided, calculate average distance from each hotel to these places and sort accordingly
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

            results.push({ cityId, cityName, days, budget, perDayBudget, hotels: sortedHotels });
        }

        // Return planned trip data with hotel options per city
        return res.status(200).json({ success: true, message: 'Trip plan generated successfully', data: results });
    } catch (error) {
        console.error('Error planning trip:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Saves user's selected hotels for each trip segment and creates a trip record in the database
const tripHotelsSelect = async (req, res) => {
    const { userId, tripData, selectedHotels } = req.body;

    // Validate that trip segments and selected hotels arrays match in length
    if (tripData.length !== selectedHotels.length) {
        return res.status(400).json({
            success: false,
            message: 'Trip data and selected hotels must have the same length',
        });
    }

    const t = await models.sequelize.transaction();
    try {
        // Create a new trip record associated with the user
        const trip = await models.Trips.create({ userId }, { transaction: t });

        // Prepare payload linking each city segment with the selected hotel
        const userTripHotelsPayload = tripData.map((segment, index) => ({
            tripId: trip.id,
            cityId: segment.cityId,
            cityName: segment.cityName,
            days: segment.days,
            budget: segment.budget,
            touristDestinationIds: segment.touristDestinationIds || [],
            hotelId: selectedHotels[index],
        }));

        // Bulk insert user trip hotel selections within the transaction
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

// Retrieves all trips for a user along with summary of cities and trip details
const viewUserTrips = async (req, res) => {
    try {
        const userId = parseInt(req.query.id);

        // Fetch trips for user with associated trip hotel data
        const trips = await models.Trips.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            include: [{ model: models.UserTripHotels, as: 'tripHotels' }],
        });

        // Format trips to include city info and trip metadata
        const formattedTrips = trips.map((trip) => ({
            tripId: trip.id,
            createdAt: trip.createdAt,
            updatedAt: trip.updatedAt,
            cities: trip.tripHotels.map((th) => ({
                cityName: th.cityName,
                days: th.days,
                budget: th.budget,
                touristDestinationIds: th.touristDestinationIds,
            })),
        }));

        res.status(200).json({ success: true, data: formattedTrips });
    } catch (err) {
        console.error('Error fetching user trips:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// Retrieves detailed info for a single user trip, including selected hotels and tourist places
const viewSingleUserTrip = async (req, res) => {
    try {
        const userId = parseInt(req.query.id);
        const tripId = parseInt(req.query.tripId);

        if (isNaN(tripId)) return res.status(400).json({ success: false, message: 'Invalid trip ID' });

        // Fetch trip with associated hotels and hotel images
        const trip = await models.Trips.findOne({
            where: { id: tripId, userId },
            include: [
                {
                    model: models.UserTripHotels,
                    as: 'tripHotels',
                    include: [
                        {
                            model: models.Hotels,
                            as: 'hotel',
                            include: [
                                {
                                    model: models.HotelImages,
                                    as: 'images',
                                    where: { is_active: true },
                                    required: false,
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

        // Aggregate all tourist place IDs from trip segments
        const allTouristPlaceIds = trip.tripHotels.flatMap((th) => th.touristDestinationIds || []);
        let topLevelTouristPlaces = [];
        if (allTouristPlaceIds.length > 0) {
            // Fetch detailed tourist place info with images
            topLevelTouristPlaces = await models.TouristPlace.findAll({
                where: { id: allTouristPlaceIds },
                include: [{ model: models.TouristPlaceImages, as: 'images', required: false }],
            });
        }

        // Format response with trip, hotels, and tourist place details
        const formattedTrip = {
            tripId: trip.id,
            cities: trip.tripHotels.map((th) => ({
                cityId: th.cityId,
                cityName: th.cityName,
                days: th.days,
                budget: th.budget,
                hotels: th.hotel
                    ? {
                          id: th.hotel.id,
                          name: th.hotel.name,
                          pricePerNight: th.hotel.pricePerNight,
                          rating: th.hotel.rating,
                          address: th.hotel.address,
                          image: th.hotel.images[0]?.imagePublicId,
                      }
                    : null,
            })),
            touristPlaces: topLevelTouristPlaces.map((tp) => ({
                id: tp.id,
                name: tp.name,
                image: tp.images[0]?.imagePublicId,
            })),
        };

        res.status(200).json({ success: true, data: formattedTrip });
    } catch (err) {
        console.error('Error fetching single trip:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

module.exports = { planTouristTrip, tripHotelsSelect, viewUserTrips, viewSingleUserTrip };
