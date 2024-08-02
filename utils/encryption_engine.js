/**
 * @file encryption_engine.js
 * 
 * @brief This file holds all function that will be used for the generation
 * and use of the public/private keys and passwords
 * 
 * @author Bryce Schmisseur
 */

const crypto = require('crypto')
const fs = require('fs')

/**
 * @brief Function to generate a public and private key
 * 
 * @param {String} directoryPath - path to where the private key will be stored
 * @param {String} password - the password used to generate the users keys
 * 
 * @return {Map} keys - a map containing the paths of the public key and private key
 */
exports.generateKeyPair = function(directoryPath, password) {

    // Generate the key pair
    const keyPair = crypto.generateKeyPair('rsa', {
        modulusLength: process.env.CRYPTO_PUBLIC_KEY_LENGTH,
        publicKeyEncoding: {
            type: process.env.CRYPTO_PUBLIC_ENCODING_TYPE,
            format: process.env.CRYPTO_ENCODING_FORMAT 
        },
        privateKeyEncoding: {
            type: process.env.CRYPTO_PRIVATE_ENCODING_TYPE,
            format: process.env.CRYPTO_ENCODING_FORMAT,
            passphrase: password
        }
    });

    // Write the generated private key to a file
    fs.writeFileSync(directoryPath + "public_key.pem", keyPair.publicKey)
    fs.writeFileSync(directoryPath + "private_key.pem", keyPair.privateKey);

    // Return a map of the public and private keys
    return {
        publicKey: directoryPath + "public_key.pem",
        privateKey: directoryPath + "private_key.pem"
    }
}

/**
 * @brief Function to create a signature of a message
 * 
 * @param {String} message - the message to create the signature of 
 * @param {String} privateKeyPath - File path to a private key
 * 
 * @return {String} encryptedSignature - the generated signature of the message
 */
exports.generateMessageSignature = function(message, privateKeyPath) {
    // Read the private key file
    const privateKeyFile = fs.readFileSync(privateKeyPath, 'utf8');

    // Convert PEM key to a crypto Key object
    const privateKey = crypto.createPrivateKey({
        key: privateKeyFile,
        format: process.env.CRYPTO_ENCODING_FORMAT
    });

    // Create hash of message
    const signHash = crypto.createSign(process.env.HASHING_ALGORITHM);
    signHash.update(message);

    // Create signature from hash
    const signature = signHash.sign(privateKey, process.env.HASHING_FORMAT);

    return signature
}

/**
 * @brief Validate message and signature
 * 
 * @param {String} message - the message to create the signature of
 * @param {String} encryptedSignature - the generated signature of the message
 * @param {String} publicKey - the associated public key used to encrypt the hash
 * 
 * @return {boolean} validatedMessage - boolean to determine the authenticity of the message
 */
exports.validateMessage = function(message, encryptedSignature, publicKey) {
    // Initialize function properties
    authenticatedMessage = false;

    // Create object to verify hash
    const verifier = crypto.createVerify(process.env.HASHING_ALGORITHM)
    verifier.update(message)

    // Authenticate Message
    authenticatedMessage = verifier.verify(publicKey, encryptedSignature, process.env.HASHING_FORMAT)

    return authenticatedMessage
}

/**
 * @brief Function to generate a hash of a given password
 * 
 * @param {*} password - user entered password
 * 
 * @returns {String} hashedPassword - the generated hash
 */
exports.hashPassword = function(password) {
    // Generate the salt and hash of the password
    const salt = crypto.randomBytes(16).toString(process.env.HASHING_FORMAT);
    const hash = crypto.pbkdf2Sync(password, salt, process.env.PASSWORD_HASHING_ITERATIONS, process.env.PASSWORD_HASHING_LENGTH, process.env.HASHING_ALGORITHM).toString(process.env.HASHING_FORMAT);

    // Combine the salt and hash
    const hashedPassword = `${salt}:${hash}`;

    return hashedPassword
}

/**
 * @brief Function to compare an inputted password with a hashed password
 * 
 * @param {*} password - the inputted password
 * @param {*} hashedPassword - the stored version of the password
 * 
 * @returns {boolean} - the validity of the inputted password
 */
exports.verifyPassword = function(password, hashedPassword) {
    // Split the salt from the hash of the current password
    const [salt, hash] = hashedPassword.split(':');

    // Generate a hash of the imputed password
    const currentHash = crypto.pbkdf2Sync(password, salt, process.env.PASSWORD_HASHING_ITERATIONS, process.env.PASSWORD_HASHING_LENGTH, process.env.HASHING_ALGORITHM).toString(process.env.HASHING_FORMAT);

    return currentHash === hash
}