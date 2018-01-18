const faker = require("faker");
const db = require("../models/db.js");
const user = require("../models/user.js");

function createSigners(start, iterations) {
    const userQuery =
        "INSERT INTO users (first, last, email, pass) VALUES ($1, $2, $3, $4) RETURNING id";

    for (let i = start; i < iterations; i++) {
        let first = faker.name.firstName();
        let last = faker.name.lastName();
        let email = faker.internet.email();
        let password = faker.internet.password();

        let city = null;
        if (Math.random() >= 0.5) {
            city = faker.address.city();
        }

        let age = null;
        if (Math.random() >= 0.5) {
            age = Math.floor(Math.random() * 70 + 12);
        }

        let url = null;
        if (Math.random() >= 0.5) {
            url = faker.internet.url();
        }

        user.hashPassword(password).then(hashedPassword => {
            db
                .query(userQuery, [first, last, email, hashedPassword])
                .then(results => {
                    let userId = results.rows[0].id;
                    user
                        .updateProfile(age, city, url, userId)
                        .then(() => {
                            const signatureQuery =
                                "INSERT INTO signatures (signature, user_id) VALUES ($1, $2)";
                            let dataUri = faker.image.dataUri(400, 200);

                            db
                                .query(signatureQuery, [dataUri, userId])
                                .then(() => {
                                    console.log(userId);
                                })
                                .catch(err => {
                                    console.error("query error", err.message, err.stack);
                                });
                        })
                        .catch(err => {
                            console.log("query error", err.message, err.stack);
                        });
                })
                .catch(err => {
                    console.log("query error", err.message, err.stack);
                });
        });
    }
}

createSigners(1, 100);
