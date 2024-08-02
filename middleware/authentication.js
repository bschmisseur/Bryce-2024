/**
 * @file authentication.js
 * 
 * @brief File implementing middleware functionality for authentication of HTTP request
 * 
 * @author Bryce Schmisseur
 */

const User = require('../../models/user');
const EncryptionEngine = require('../utils/encryption_engine')

/**
 * @brief Middleware function to authenticate the current username and password
 * 
 * @param {*} req - current request object
 * @param {*} res - current response object
 * @param {*} next - the next function call for the request
 */
const basicAuthentication = async ( req, res, next ) => {
    // Parse the authentication header from the current request; return error if none
    const authenticationHeader = req.header.authorization;

    if(!authenticationHeader){
        return res.status(401).send('Authentication required!');
    }

    // Parse out the type of authentication and password; return error if not Basic
    const [ scheme , password ] = authenticationHeader.split(' ');

    if ( scheme !== "Basic" ){
        return res.status(401).send("Invalid authentication scheme!");
    }

    // Retrieve the current user
    user = await User.find({username: req.params.username});
    if (user == null) {
        //If no users are found associated with the id an HTTP 404 RESPONSE will be send back
        res.status(404).json({ message: `Can not find the associated user's account`})
    }

    // Call encryption engine to validate teh password
    validPassword = EncryptionEngine.verifyPassword(password, user.password);

    if (validPassword == true)
    {
        return next();
    }

    // Any other action should be denied access
    res.status(403).send("Forbidden Access!");
}

// Export authentication middle ware
module.exports = basicAuthentication;