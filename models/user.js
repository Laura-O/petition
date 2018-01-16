const bcrypt = require("bcryptjs");
const db = require("../models/db.js");

function hashPassword(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, (err, hash) => {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
}

function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, (err, doesMatch) => {
            if (err) {
                reject(err);
            } else {
                resolve(doesMatch);
            }
        });
    });
}

function checkSigned(userId) {
    return new Promise(function(resolve, reject) {
        let query = "SELECT * from signatures WHERE user_id = $1";
        db
            .query(query, [userId])
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                console.error("query error", err.message, err.stack);
                reject(err);
            });
    });
}

module.exports = {
    hashPassword: hashPassword,
    checkPassword: checkPassword,
    checkSigned: checkSigned,
};
