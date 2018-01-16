const express = require("express");
const router = express.Router();
const db = require("../models/db.js");
const middleware = require("../middleware/index.js");
const csrf = require("csurf");
const bodyParser = require("body-parser");
const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: false });

router.get("/petition", csrfProtection, middleware.requireSession, function(req, res) {
    var scripts = [{ script: "/js/main.js" }];
    res.render("petition/sign", {
        csrfToken: req.csrfToken(),
        scripts: scripts,
        user: req.session.user,
        error: req.flash("error"),
        info: req.flash("info"),
    });
});

router.post("/petition", parseForm, csrfProtection, function(req, res) {
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

router.get("/thanks", middleware.requireSigned, (req, res) => {
    let query = "SELECT * FROM users join signatures on $1 = signatures.user_id";

    db
        .query(query, [req.session.user.id])
        .then(results => {
            res.render("petition/thanks", {
                img: results.rows[0].signature,
                user: {
                    first: req.session.user.first,
                    last: req.session.user.last,
                },
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
