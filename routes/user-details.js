const express = require('express');
const router = express.Router();
const { getUserData } = require('../services/user-details');
const { check } = require('express-validator');

router.get('/get-user-data', [check('email', 'Email cannot be empty')?.notEmpty()], getUserData);

module.exports = router;
