/**
 * @file index.js
 * 
 * @brief This file contains functionality to be used as the main entry point of 
 * this JavaScript application
 * 
 * @author Bryce Schmisseur
 */

const Server = require('./utils/server')
const Client = require('./utils/client')

console.log("Starting application...")

/**
 * Start server
 */
console.log("Starting Server...")
Server.startServer()

/**
 * Start client application
 */
Client.runClient()

return 0

