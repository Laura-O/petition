const bcrypt = require("bcryptjs");
const db = require("../models/db.js");

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

function updateUser(first, last, email, user_id) {
    console.log("update user: ", first, last, email, user_id);
    return new Promise((resolve, reject) => {
        let query = "UPDATE users SET first=$1, last=$2, email=$3 WHERE id=$4";

        db
            .query(query, [first, last, email, user_id])
            .then(() => {
                resolve();
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
    updateProfile: updateProfile,
    updateUser: updateUser,
};
