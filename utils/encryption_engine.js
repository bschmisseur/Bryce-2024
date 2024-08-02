/**
 * @file encryption_engine.js
 * 
 * @brief This file holds all function that will be used for the generation
 * and use of the public/private keys
 * 
 * @author Bryce Schmisseur
 */

const crypto = require('crypto')
const currentUser = require('../session/storage')
const fs = require('fs')

/**
 * @brief Function to generate a public and private key
 * 
 * @param {String} directoryPath - path to where the private key will be stored
 * 
 * @return {Map} keys - a map containing the public key and path to the private key
 */
exports.generateKeyPair = function(filePath) {

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
            passphrase: currentUser.password
        }
    });

    // Write the generated private key to a file
    fs.writeFileSync(filePath, keyPair.privateKey);

    // Return a map of the public and private keys
    return {
        publicKey: publicKey,
        privateKey: privateKey
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
    authenticatedMessage = verifier.verify(publicKey, signature, process.env.HASHING_FORMAT)

    return authenticatedMessage
}