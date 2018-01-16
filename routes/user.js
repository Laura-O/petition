const express = require("express");
const router = express.Router();
const db = require("../models/db.js");
const middleware = require("../middleware/index.js");

router.get("/profile", middleware.requireSession, function(req, res) {
    let query = "SELECT * FROM user_profiles WHERE user_id = $1";

    db
        .query(query, [req.session.user.id])
        .then(results => {
            if (results.rows.length > 0) {
                res.render("user/profile", {
                    user: req.session.user,
                    age: results.rows[0].age,
                    city: results.rows[0].city,
                    url: results.rows[0].url,
                    error: req.flash("error"),
                    info: req.flash("info"),
                });
            } else {
                res.render("user/profile", {
                    user: req.session.user,
                    error: req.flash("error"),
                    info: req.flash("info"),
                });
            }
        })
        .catch(err => {
            console.error("query error", err.message, err.stack);
        });
});

router.post("/profile", middleware.requireSession, function(req, res) {
    let query =
        "INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id, age = EXCLUDED.age, city = EXCLUDED.city, url = EXCLUDED.url";

    let { city, url, age } = req.body;

    db
        .query(query, [age, city, url, req.session.user.id])
        .then(results => {
            res.redirect("/petition");
        })
        .catch(err => {
            console.error("query error", err.message, err.stack);
        });
});

router.get("/profile/edit", middleware.requireSession, function(req, res) {
    let query = "SELECT * FROM user_profiles WHERE user_id = $1";

    db
        .query(query, [req.session.user.id])
        .then(results => {
            console.log(results);
        })
        .catch(err => {
            console.error("query error", err.message, err.stack);
        });
});

module.exports = router;
