/**
 * @file user_route.js
 * 
 * @brief File containing all the end points for the user object
 * 
 * @author Bryce Schmisseur
 */

const express = require('express');
const router = express.router();
const User = require('../../models/user');

router.get('/:username', async (req, res) => {
    try {
        const user = await User.find();

        res.json(user);
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})