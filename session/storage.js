/**
 * @file storage.js
 * 
 * @details This file hold the current user of the program. In a production env
 * this functionality would be implemented through sessions variables instead
 */

const User = require('../models/user')

const currentUser = new User()

module.exports = {
    currentUser
}