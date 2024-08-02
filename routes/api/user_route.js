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

/**
 * @brief Get request to see if a username is already included in the database
 * 
 * @type HTTP GET
 * 
 * @return {boolean} validUser - true if the username can be found in the database
 *                               false or error in any other case
 */
router.get('/:username', async (req, res) => {
    try 
    {
        //Finds the user based on the user id
        user = await User.find({username: req.params.username})
        if (user == null) {
            //If no users are found associated with the id an HTTP 404 RESPONSE will be send back
            res.status(404).json({ message: 'Cant find any users'})
        } else {
            //Response with the full user object
            res.json({validUser: true})
        }
    } catch(err) {
        //If any error is caught a HTTP 500 RESPONSE is set back with the error message
        res.status(500).json({ message: err.message })
    }
});

/**
 * @brief Get request to retrieve the associated public key of the username
 * 
 * @type HTTP GET
 * 
 * @return {String} publicKey - the public key associate with the given use account 
 *                              false or error in any other case
 */
router.get('/publickey/:username', async (req, res) => {
    try 
    {
        //Finds the user based on the user id
        user = await User.find({username: req.params.username})
        if (user == null) {
            //If no users are found associated with the id an HTTP 404 RESPONSE will be send back
            res.status(404).json({ message: 'Cant find any users'})
        } else {
            //Respond withe the public key of the user
            res.json({publicKey: user.publicKey})
        }
    } catch(err) {
        //If any error is caught a HTTP 500 RESPONSE is set back with the error message
        res.status(500).json({ message: err.message })
    }
});


/**
 * @brief Post request to save a users information to the database
 * 
 * @type HTTP POST
 * 
 * @return {User} user - the saved user's information to the database
 */
router.post('/', async (req, res) => {
    //Creates user object based on body parameters of the HTTP request
    const user = new User({
        username: req.body.username,
        password: req.body.password,
        publicKey: ""
    });
    try {
        //Saves the user object to MongoDB
        const newUser = await user.save()
  
        //Creates a HTTP 201 RESPONSE with full user object to confirm post
        res.status(201).json(newUser)
    } catch (err) {
        //If any error is caught a HTTP 500 RESPONSE is set back with the error message
        res.status(500).json({ message: err.message })
    }
})

/**
 * @brief Post request to be able to update the publicKey field of the user
 * 
 * @type HTTP POST
 * 
 * @return {User} user - the updated user's information to the database
 */
router.post('/update', async (req, res) => {
    try {
        User.findOneAndUpdate({_id: req.body._id}, {$set: {publicKey: req.body.publicKey}}, {new: true, upsert: true}, function (err, user) {
            if ( err ) {
                res.status(404).json({ message: 'Cant find any users'})
            } else {
                res.json(user)
            }        
        });
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})
