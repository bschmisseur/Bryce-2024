/**
 * @file user.js
 * 
 * @brief File to hold the model information for a user object
 * 
 * @author Bryce Schmisseur
 */

const mongoose = require('mongoose')

/**
 * @brief Mongoose schema to hold the users information
 * 
 * @property username - String: the username given by the user
 * @property password - String: the password associated with the users account
 * @property publicKey - String: the public key associated with the users account
 * 
 */
const userSchema = new mongoose.Schema(
    {
        username: String,
        password: String,
        publicKey: String
    }
)

// Export schema
module.exports = mongoose.model('user', userSchema)