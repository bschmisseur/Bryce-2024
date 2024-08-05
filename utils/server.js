

const express = require('express');
const mongoose = require('mongoose');
const UserRouter = require('../routes/api/user_route')
const EncryptionRouter = require('../routes/api/encryption_route') 

/**
 * @brief Function to initialize the server of the application
 */
exports.startServer = function () {

    // Create Express application
    const app = express();

    //In order to process the HTTP request within the logs statements
    app.use(express.urlencoded({ extended: true }));

    //Grabs the port from the .env file or the given parameter
    const PORT = process.env.APPLICATION_PORT | 3001;

    // Create a hello world page for the server
    app.get('/', (req, res) => {
        res.send('Hello World!')
    })

    // Open connection to a Mongo DB Instance
    mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    const db = mongoose.connection
    db.on('error', (error) => console.error(error))
    app.use(express.json());
    db.once('open', () => console.log('Connected to database'))

    // Add routes to applications
    app.use('api/user', UserRouter)
    app.use('api/encryption', EncryptionRouter)

    //Starts to listen for request for the server=
    app.listen(PORT, () => {
        console.log(`Key Pair Encryption app listening at http://localhost:${PORT}`)
    });
}