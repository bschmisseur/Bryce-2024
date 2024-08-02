/**
 * @file authentication.js
 * 
 * @brief File implementing middleware functionality for authentication of HTTP request
 * 
 * @author Bryce Schmisseur
 */

const currentUser = require('../session/storage')

/**
 * @brief Middleware function to authenticate the current username and password
 * 
 * @param {*} req - current request object
 * @param {*} res - current response object
 * @param {*} next - the next function call for the request
 * 
 * @returns 
 */
const basicAuthentication = ( req, res, next ) => {
    // Parse the authentication header from the current request; return error if none
    const authenticationHeader = req.header.authorization;

    if(!authenticationHeader){
        return res.status(401).send('Authentication required!');
    }

    // Parse out the type of authentication and credentials; return error if not Basic
    const [ scheme , credentials ] = authenticationHeader.split(' ');

    if ( scheme !== "Basic" ){
        return res.status(401).send("Invalid authentication scheme!");
    }

    // Decode and compare the credentials to the current user's credentials; call next function on success
    const [username, password] = Buffer.from(credentials, 'base64').toString().split(":");

    if (currentUser.username === username && currentUser.password === password)
    {
        return next();
    }

    // Any other action should be denied access
    res.status(403).send("Forbidden Access!");
}

// Export authentication middle ware
module.exports = basicAuthentication;