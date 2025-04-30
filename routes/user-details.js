
const express = require('express');
const router = express.Router();
const { getUserData } = require('../services/users');
const { check, validationResult } = require('express-validator');

router.post('/get-user-data', [
    check('email','Email cannot be empty').notEmpty()
    ], (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()){
            res.status(400).json({ success: false, error: errors.array() });
            return;
        }
    next();
}, getUserData);


module.exports = router;