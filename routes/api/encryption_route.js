/**
 * @file encryption_route.js
 * 
 * @brief File containing all the end points for encryption of messages
 * 
 * @author Bryce Schmisseur
 */

const express = require('express')
const router = express.router()
const User = require('../../models/user');
const EncryptionEngine = require('../../utils/encryption_engine')

/**
 * @brief Get request to input a messages information and verify it authenticity
 * 
 * @type HTTP GET
 * 
 * @return If the message and signature if valid return 200; else return error
 */
router.get('/verifyMessage', async (req, res) => {
    try 
    {
        //Finds the user based on the user name
        user = await User.find({username: req.body.sentFrom})
        if (user == null) {
            //If no users are found associated with the id an HTTP 404 RESPONSE will be send back
            res.status(404).json({ message: 'The user specified is not registered'})
        } 

        // Call function to verify message
        messageAuthenticated = EncryptionEngine.validateMessage(req.body.message, req.body.signature, user.publicKey);

        // Return response to the user of the outcome of verifying the message
        if (messageAuthenticated == true) {
            res.status(200).json({message: 'Successfully Verified Signed Message!'})

        } else {
            res.status(418).json({message: 'The signed message was NOT signed by the user inputted!'})
        }
    } catch(err) {
        //If any error is caught a HTTP 500 RESPONSE is set back with the error message
        res.status(500).json({ message: err.message })
    }
});