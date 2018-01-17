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
            info: req.flash("info")
        });
    } else {
        req.flash("info", "You are already registered!");
        res.redirect("/");
    }
});

router.post("/register", parseForm, csrfProtection, (req, res) => {
    let query = "INSERT INTO users (first, last, email, pass) VALUES ($1, $2, $3, $4) RETURNING id";
    const { first, last, email, password } = req.body;

    if (!(first && last && email && password)) {
        req.flash("error", "Plase fill out all fields!");
        return res.redirect("/register");
    }

    user.hashPassword(password).then(hashedPassword => {
        db
            .query(query, [first, last, email, hashedPassword])
            .then(results => {
                req.session.user = {
                    id: results.rows[0].id,
                    first: first
                };
                res.redirect("/profile");
            })
            .catch(err => {
                console.error("query error", err.message, err.stack);
                req.flash("error", "An user with this email address already exists!");
                return res.redirect("/register");
            });
    });
});

router.get("/login", csrfProtection, (req, res) => {
    // console.log("Login user session: ", req.session.user);
    if (!req.session.user) {
        res.render("user/login", {
            csrfToken: req.csrfToken(),
            user: req.session.user,
            error: req.flash("error"),
            info: req.flash("info")
        });
    }
});

router.post("/login", csrfProtection, (req, res) => {
    let query = "SELECT * FROM users WHERE email = $1";
    const { email, password } = req.body;

    if (!(email && password)) {
        req.flash("error", "Plase enter email address and password!");
        return res.redirect("/login");
    }

    db
        .query(query, [email])
        .then(results => {
            console.log(results.rows[0]);
            req.session.user = {
                id: results.rows[0].id,
                first: results.rows[0].first
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
                                        signed: true
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
    res.redirect("/");
});

module.exports = router;
