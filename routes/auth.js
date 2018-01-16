const express = require("express");
const router = express.Router();
const user = require("../models/user.js");
const db = require("../models/db.js");
const csrf = require("csurf");
const bodyParser = require("body-parser");
const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: false });

router.get("/register", csrfProtection, (req, res) => {
    if (!req.session.user) {
        res.render("user/register", {
            csrfToken: req.csrfToken(),
            error: req.flash("error"),
            info: req.flash("info"),
        });
    } else {
        req.flash("info", "You are already registered!");
        res.redirect("/");
    }
});

router.post("/register", parseForm, csrfProtection, (req, res) => {
    let query = "INSERT INTO users (first, last, email, pass) VALUES ($1, $2, $3, $4) RETURNING id";

    user.hashPassword(req.body.password).then(password => {
        db
            .query(query, [req.body.first, req.body.last, req.body.email, password])
            .then(results => {
                req.session.user = {
                    id: results.rows[0].id,
                    first: req.body.first,
                    last: req.body.last,
                    email: req.body.email,
                };
                res.redirect("/profile");
            })
            .catch(err => {
                console.error("query error", err.message, err.stack);
            });
    });
});

router.get("/login", csrfProtection, (req, res) => {
    console.log("Login user session: ", req.session.user);
    if (!req.session.user) {
        res.render("user/login", {
            csrfToken: req.csrfToken(),
            user: req.session.user,
            error: req.flash("error"),
            info: req.flash("info"),
        });
    }
});

router.post("/login", csrfProtection, (req, res) => {
    const { email, password } = req.body;
    let query = "SELECT * FROM users WHERE email = $1";

    db
        .query(query, [email])
        .then(results => {
            console.log(results.rows[0]);
            req.session.user = {
                id: results.rows[0].id,
                first: results.rows[0].first,
            };

            user
                .checkPassword(password, results.rows[0].pass)
                .then(result => {
                    if (result) {
                        user
                            .checkSigned(results.rows[0].id)
                            .then(signed => {
                                if (signed.rows[0]) {
                                    req.session.user = {
                                        id: results.rows[0].id,
                                        first: results.rows[0].first,
                                        signed: true,
                                    };
                                    res.redirect("/thanks");
                                } else {
                                    res.redirect("/petition");
                                }
                            })
                            .catch(err => {
                                console.error("query error", err.message, err.stack);
                            });
                    } else {
                        req.flash("info", "Your email or password is wrong!");
                        res.redirect("/login");
                    }
                })
                .catch(err => {
                    console.error("query error", err.message, err.stack);
                });
        })
        .catch(err => {
            console.error("query error", err.message, err.stack);
        });
});

router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/petition");
});

module.exports = router;
