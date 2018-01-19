const express = require("express");
const router = express.Router();
const db = require("../models/db.js");
const user = require("../models/user.js");
const middleware = require("../middleware/index.js");
const csrf = require("csurf");
const bodyParser = require("body-parser");
const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: false });

router.get("/profile", csrfProtection, middleware.requireSession, (req, res) => {
    let query = "SELECT * FROM user_profiles WHERE user_id = $1";

    db
        .query(query, [req.session.user.id])
        .then(results => {
            res.render("user/profile", {
                csrfToken: req.csrfToken(),
                user: results.rows[0],
                error: req.flash("error"),
                info: req.flash("info")
            });
        })
        .catch(err => {
            console.error("query error", err.message, err.stack);
        });
});

router.post("/profile", parseForm, csrfProtection, middleware.requireSession, (req, res) => {
    let city = req.body.city || null;
    let age = req.body.age || null;
    let url = req.body.url || null;

    user
        .updateProfile(age, city, url, req.session.user.id)
        .then(() => {
            res.redirect("/petition");
        })
        .catch(err => {
            console.error("query error", err.message, err.stack);
            req.flash("error", "An error has occured.");
            res.redirect("/profile");
        });
});

router.get("/profile/edit", csrfProtection, middleware.requireSession, (req, res) => {
    let query =
        "SELECT first, last, email, age, city, url, pass FROM users join user_profiles on users.id = user_profiles.user_id WHERE user_id = $1";

    db
        .query(query, [req.session.user.id])
        .then(results => {
            res.render("user/edit", {
                csrfToken: req.csrfToken(),
                user: results.rows[0],
                error: req.flash("error"),
                info: req.flash("info")
            });
        })
        .catch(err => {
            console.error("query error", err.message, err.stack);
        });
});

router.post("/profile/edit", parseForm, csrfProtection, middleware.requireSession, (req, res) => {
    let { first, last, email } = req.body;

    // Return to form when not all information was entered
    if (!(first && last && email)) {
        req.flash("error", "Please enter all required fields!");
        return res.redirect("/profile/edit");
    }

    // If an empty string was passed, the value should be 'null'
    let city = req.body.city || null;
    let age = req.body.age || null;
    let url = req.body.url || null;
    let pass = req.body.pass || null;

    user
        .updateUser(first, last, email, req.session.user.id, pass)
        .then(() => {
            user
                .updateProfile(age, city, url, req.session.user.id)
                .then(() => {
                    res.redirect("/petition");
                })
                .catch(err => {
                    console.error("query error", err.message, err.stack);
                    req.flash("error", "An error has occured.");
                    res.redirect("/profile");
                });
        })
        .catch(err => {
            console.error("query error", err.message, err.stack);
            req.flash("error", "An error has occured.");
            res.redirect("/profile");
        });
});

module.exports = router;
