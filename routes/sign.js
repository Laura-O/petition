const express = require("express");
const router = express.Router();
const db = require("../models/db.js");
const middleware = require("../middleware/index.js");
const csrf = require("csurf");
const bodyParser = require("body-parser");
const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: false });

router.get("/petition", csrfProtection, middleware.requireSession, (req, res) => {
    let scripts = [{ script: "/js/main.js" }];

    if (!req.session.user.signed) {
        res.render("petition/sign", {
            csrfToken: req.csrfToken(),
            scripts: scripts,
            user: req.session.user,
            error: req.flash("error"),
            info: req.flash("info"),
        });
    } else {
        req.flash("info", "You have already signed our petition!");
        res.redirect("/thanks");
    }
});

router.post("/petition", parseForm, csrfProtection, (req, res) => {
    let query = "INSERT INTO signatures (signature, user_id) VALUES ($1, $2)";

    db
        .query(query, [req.body.hiddensig, req.session.user.id])
        .then(() => {
            req.session.user.signed = true;
            res.redirect("/thanks");
        })
        .catch(err => {
            console.error("query error", err.message, err.stack);
        });
});

router.post("/delete", csrfProtection, (req, res) => {
    let query = "DELETE FROM signatures WHERE user_id = $1";

    db
        .query(query, [req.session.user.id])
        .then(() => {
            req.session.user.signed = null;
            res.redirect("/petition");
        })
        .catch(err => {
            console.log("query error", err.message, err.stack);
        });
});

router.get("/thanks", csrfProtection, middleware.requireSigned, (req, res) => {
    let query =
        "SELECT * FROM users LEFT JOIN signatures on users.id = signatures.user_id WHERE users.id = $1";

    db
        .query(query, [req.session.user.id])
        .then(results => {
            res.render("petition/thanks", {
                csrfToken: req.csrfToken(),
                img: results.rows[0].signature,
                user: {
                    first: req.session.user.first,
                },
                error: req.flash("error"),
                info: req.flash("info"),
            });
        })
        .catch(e => {
            console.error("query error", e.message, e.stack);
        });
});

router.get("/signers", middleware.requireSigned, (req, res) => {
    let query =
        "SELECT first, last, age, city, url from users join signatures on users.id = signatures.user_id join user_profiles on users.id = user_profiles.user_id";

    db
        .query(query)
        .then(results => {
            console.log(results.rows);
            res.render("petition/signers", {
                user: req.session.user,
                results: results.rows,
            });
        })
        .catch(e => {
            console.error("query error", e.message, e.stack);
        });
});

router.get("/signers/:city", middleware.requireSigned, (req, res) => {
    let query =
        "SELECT * from users join signatures on users.id = signatures.user_id join user_profiles on users.id = user_profiles.user_id WHERE user_profiles.city = $1";

    db
        .query(query, [req.params.city])
        .then(results => {
            console.log(results);
            res.render("petition/signers-city", {
                user: req.session.user,
                results: results.rows,
                city: req.params.city,
            });
        })
        .catch(e => {
            console.error("query error", e.message, e.stack);
        });
});

module.exports = router;
