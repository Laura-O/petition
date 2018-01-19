const bcrypt = require("bcryptjs");
const db = require("../models/db.js");
const redis = require("../middleware/redis.js");

// hashPassword() hashes a plain password and returns it
function hashPassword(plainTextPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt((err, salt) => {
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

/**
 * checkPassword() checks if both passed-in passwords match
 * @param textenterdInLoginForm Plain text password entered in the form
 * @param hashedPasswordFromDatabase Hashed password from db
 */
function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, (err, doesMatch) => {
            if (err) {
                reject(err);
            } else {
                resolve(doesMatch);
            }
        });
    });
}

// checkSigned() checks if the userId has already signed the petition
function checkSigned(userId) {
    return new Promise((resolve, reject) => {
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

/**
 * updateProfile inserts user information in the user_profiles table
 * if there is already data for this user_id, the information is updated
 */
function updateProfile(age, city, url, userId) {
    return new Promise((resolve, reject) => {
        let query =
            "INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id, age = EXCLUDED.age, city = EXCLUDED.city, url = EXCLUDED.url";

        db
            .query(query, [age, city, url, userId])
            .then(() => {
                resolve();
            })
            .catch(err => {
                console.error("query error", err.message, err.stack);
                reject(err);
            });
    });
}

/**
 * updateuser() updates the database based on the passed-in data
 * If a password was passed, it is hashed and updated
 */

function updateUser(first, last, email, user_id, pass) {
    let query = "";
    let values = [first, last, email, user_id];

    // Use a promise for updating password and not updating password cases
    let prom;

    if (pass) {
        console.log("change password");
        query = "UPDATE users SET first=$1, last=$2, email=$3, pass=$5 WHERE id=$4";
        prom = hashPassword(pass)
            .then(hashedPassword => {
                values.push(hashedPassword);
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        console.log("do not change password");
        query = "UPDATE users SET first=$1, last=$2, email=$3 WHERE id=$4";
        values = [first, last, email, user_id];
        prom = Promise.resolve(undefined);
    }

    return prom
        .then(() => {
            db
                .query(query, values)
                .then(result => {
                    console.log(result);
                })
                .catch(err => {
                    console.error("query error", err.message, err.stack);
                });
        })
        .catch(err => {
            console.error("query error", err.message, err.stack);
        });
}

// getSigners() gets and returns all signers of the petition
function getSigners() {
    return new Promise((resolve, reject) => {
        let query =
            "SELECT first, last, age, city, url from users join signatures on users.id = signatures.user_id join user_profiles on users.id = user_profiles.user_id";

        /**
         * Check if signers are in cache.
         * If yes, get them from cache
         * If no, get them from the db and put them in the cache
         */
        redis.get("signers").then(signers => {
            if (signers) {
                resolve(JSON.parse(signers));
            } else {
                db
                    .query(query)
                    .then(results => {
                        redis.set("signers", JSON.stringify(results));
                        resolve(results);
                    })
                    .catch(err => {
                        console.error("query error", err.message, err.stack);
                        reject(err);
                    });
            }
        });
    });
}

module.exports = {
    hashPassword,
    checkPassword,
    checkSigned,
    updateProfile,
    updateUser,
    getSigners
};
