const express = require("express");
const router = express.Router();
const user = require("../models/user.js");
const db = require("../models/db.js");
const middleware = require("../middleware/index.js");

router.get("/register", (req, res) => {
    res.render("petition-register", {});
});

router.post("/register", (req, res) => {
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
                res.redirect("/petition");
            })
            .catch(err => {
                console.error("query error", err.message, err.stack);
            });
    });
});

router.get("/login", (req, res) => {
    res.render("petition-login", {
        user: req.session.user,
    });
});

router.post("/login", (req, res) => {
    const { email, password } = req.body;
    let query = "SELECT pass FROM users WHERE email = $1";

    db
        .query(query, [email])
        .then(dbPassword => {
            user
                .checkPassword(password, dbPassword.rows[0].pass)
                .then(result => {
                    if (result) {
                    } else {
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
    console.log("post");
    req.session = null;
    res.redirect("/petition");
});

module.exports = router;
