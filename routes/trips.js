const express = require('express');
const { check, validationResult } = require('express-validator');
const { planTouristTrip, tripHotelsSelect } = require('../services/trips');

const router = express.Router();

router.post(
    '/planTouristTrip',
    [
        check('tripData').isArray().withMessage('tripData must be an array'),

        check('tripData.*.cityId', 'City ID is required and must be numeric').isNumeric(),
        check('tripData.*.days', 'Days must be a positive number').isInt({ min: 1 }),
        check('tripData.*.budget', 'Budget must be a positive number').isFloat({ min: 50 }),
        check('tripData.*.touristDestinationIds')
            .optional()
            .isArray()
            .withMessage('touristDestinationIds must be an array'),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    },
    planTouristTrip
);

router.post(
    '/tripHotelsSelect',
    [
        check('userId', 'userId is required and must be numeric').isInt({ min: 1 }),
        check('tripData', 'tripData must be an array').isArray({ min: 1 }),
        check('tripData.*.cityId', 'City ID is required and must be numeric').isInt({ min: 1 }),
        check('tripData.*.cityName', 'City name is required').isString(),
        check('tripData.*.days', 'Days must be a positive integer').isInt({ min: 1 }),
        check('tripData.*.budget', 'Budget must be a positive number').isFloat({ min: 50 }),
        check('tripData.*.touristDestinationIds')
            .optional()
            .isArray()
            .withMessage('touristDestinationIds must be an array'),
        check('selectedHotels', 'selectedHotels must be an array').isArray({ min: 1 }),
        check('selectedHotels.*', 'Each selected hotel must be numeric').isInt({ min: 1 }),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    },
    tripHotelsSelect
);

module.exports = router;
