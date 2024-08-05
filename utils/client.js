/**
 * @file client.js
 * 
 * @brief This file contains all functionality that is used to implement
 * the client side of the applications
 * 
 * @author Bryce Schmisseur
 */

const axios = require('axios')
const fs = require('fs');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const User = require('../models/user')
const EncryptionEngine = require('./encryption_engine')

const BASE_ADDRESS = "http://localhost:3001/api"
const USER_BASE_ADDRESS = `${BASE_ADDRESS}/user`
const ENCRYPTION_BASE_ADDRESS = `${BASE_ADDRESS}/encryption`

/**
 * @brief Function to see if a user account has already been created
 * 
 * @param {*} username 
 * 
 * @returns {Boolean} validUser - true is the username already has an account
 */
async function validateUser(username){
    console.log("Validating User...")

    try {
        const response = await axios.get(`${USER_BASE_ADDRESS}/${username}`);

        return response.data.validUser;

    } catch (error) {
        console.log("Error while processing request");

        return false;
    }
}

/**
 * @brief Function to verify a username and password combination
 * 
 * @param {*} username 
 * @param {*} password 
 * 
 * @returns {Boolean} response.data - If valid user it will return the users object; else return null
 */
async function validateCredentials(username, password){
    console.log("Validate Credentials");

    try {
        const response = await axios.post(`${USER_BASE_ADDRESS}/validate`, {
            body: {
                username: username,
                password: password
            }
        });

        return response.data;

    } catch (error) {
        console.log("Error while processing request");

        return null;
    }
}

/**
 * @brief Function to create/store a user object
 * 
 * @param {*} username 
 * @param {*} password 
 * 
 * @return {User} user - the successfully created user object
 */
async function createUser(username, password){
    console.log("Validate Credentials");

    try {
        const response = await axios.post(`${USER_BASE_ADDRESS}`, {
            body: {
                username: username,
                password: password
            }
        });   

        return response.data;

    } catch (error) {
        console.log("Error while processing request");

        return null;
    }
}

/**
 * @brief Function to generate a public and private key pair
 * 
 * @param {*} user 
 * 
 * @return {Map} keys - a map containing the paths of the public key and private key
 */
function generateKeyPair(directoryPath, user) {
    console.log("Generating Key Pairs");

    keys = EncryptionEngine.generateKeyPair(directoryPath, user.password);

    return keys;
}

/**
 * @brief Function to upload/store the users public key in the database
 * 
 * @param {*} user 
 * @param {*} publicKeyFilePath 
 * 
 * @return {User} user - the successfully updated user object
 * 
 */
async function uploadPublicKey(user, publicKeyFilePath){
    console.log("Uploading public key");
    var publicKeyData = null

    // Reading File containing public key
    fs.readFile(publicKeyFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return null;s
    }
        
        publicKeyData = data;
    });

    try {
        const response = await axios.post(`${USER_BASE_ADDRESS}/update`, {
            headers: {
                'Authorization': `Basic ${user.password}`
            },
            body: {
                username: user.username,
                publicKey: publicKeyData
            } 
        });   

        return response.data;

    } catch (error) {
        console.log("Error while processing request");

        return null;
    }
}

/**
 * @brief Function to generate a signature of a given message with a given key
 * @param {*} user 
 * @param {*} privateKeyPath 
 * @param {*} message 
 * 
 * @return {String} encryptedSignature - the generated signature of the message
 */
function signMessage(user, privateKeyPath, message){
    console.log("Signing message...");

    encryptedSignature = EncryptionEngine.generateMessageSignature(message, privateKeyPath);

    return encryptedSignature;
}

/**
 * @brief Function to validate a messages signature
 * 
 * @param {*} user 
 * @param {*} message 
 * @param {*} signature 
 * @param {*} sentFrom 
 * 
 * @return {Boolean} validMessage - bool to signify the validity of the message
 */
async function validateMessage(user, message, signature, sentFrom) {
    console.log("Validating message...");

    try {
        const response = await axios.get(`${ENCRYPTION_BASE_ADDRESS}/verifyMessage`, {
            body: {
                message: message,
                signature: signature,
                sentFrom: sentFrom
            }
        });   

        if (response.status == 200){
            return true;
        } else {
            return false; 
        }

    } catch (error) {
        console.log("Error while processing request");

        return null;
    }
}

function promptUser(prompt) {
    return new Promise((resolve) => {
        readline.question(prompt, answer => {
            resolve(answer);
        })
    })
}

/**
 * @brief Function to run the client side of the application
 */
exports.runClient = async () =>  {
    // Display welcome message
    console.log('Welcome to the Key Pair Encryption Application...')
    
    // Initialize functions variables
    var currentUser = null;
    var currentKeyMap = null; 
    let exitProgram = false; 

    // Loop until the user wishes to exit
    while (exitProgram != true ) {

        // Gather the user's username
        let username = await promptUser("Please enter your username: ");

        // See if the user already has an account
        activeUser = validateUser(username);

        // Initialize loop properties user login
        let validatedUser = false;

        // Loop until valid user information has been verified
        while (validatedUser == false) {
            if (activeUser != null){
                // If the user already has an account; validate password
                console.log(`Welcome back, ${username}!`);
                let password = await promptUser("Please enter your password: ");

                currentUser = validateCredentials(username, password)
            } else {
                // If the user is new; create user account
                console.log(`Welcome, ${username}!`);

                // Hiding this use input would require a external node package
                let password = await promptUser("Please enter a password: ");

                currentUser = createUser(username, password);
            }

            // Once the user had been validated or created; break the loop
            if (currentUser != null) {
                validatedUser = true;
            }
        }

        // Initialize loop variables for key pair loop
        let uploadedKeyPairs = false; 

        // Loop until the client has set up public and private keys
        while (uploadedKeyPairs == false) {

            // Display Options to the user
            console.log("Key Pair Menu: ")
            console.log("\t1. Generate New Public and Private Keys");
            console.log("\t2. Assign Previously Generated Keys")

            let userInput = await promptUser("Please enter a number of an option above: ");

            // Conditional statement to see what option the user would like to perform
            if ( userInput == 1 ) {
                let directoryPath = await promptUser("Please enter the directory where you would like your keys stored: ")
                keyPairMap = generateKeyPair(directoryPath, currentUser);

                currentKeyMap == keyPairMap;

                uploadedKeyPairs = true;
            } 
            else if ( userInput == 2 ) {
                let publicKeyPath = await promptUser("Please enter the file path of your public key: ")
                let privateKeyPath = await promptUser("Please enter the file path for the correlating private key: ")

                currentKeyMap = {
                    publicKey: publicKeyPath,
                    privateKey: privateKeyPath
                }

                uploadedKeyPairs = true;
            }            
            else {
                console.log("Invalid input please try again!!")
            }
        }

        // Initialize variables needed for main loop
        displayMainMenu = true;

        // Loop until the user wishes to exit or sign out
        while (displayMainMenu == true)
        {
            // Display menu options for the user
            console.log("Menu Options: ");
            console.log("\t1. Upload Public Key");
            console.log("\t2. Sign Message");
            console.log("\t3. Validate Message");
            console.log("\t4. Sign out")
            console.log("\t5. Exit Program")

            // Gather the users input on what they would like today
            let userInput = await promptUser("Please enter a number of an option above: ");

            // Conditional statement to perform the action requested by the user
            if ( userInput == 1) {
                updatedUser = uploadPublicKey(currentUser, currentKeyMap.publicKey);
            }
            else if ( userInput == 2 ) {
                signature = signMessage(currentUser, currentKeyMap.privateKey);
            }
            else if ( userInput == 3 ){

                let message = await promptUser("Please enter the message to be validated: ")
                let signature = await promptUser("Enter the correlating signature: ")
                let sentFrom = await promptUser("Enter the username the message was sent from: ")

                validMessage = validateMessage(currentUser, message, signature, sentFrom)
            }
            else if (userInput == 4 ) {
                console.log("Signing out...")
                validatedUser = false;
                displayMainMenu = false; 
            }
            else if ( userInput == 5 ) {
                console.log("Exiting Program...")
                validatedUser = false;
                displayMainMenu = false; 
                exitProgram = true;
            }
            else {
                console.log("Invalid input please try again!!")
            }
        }
    }
}
