const express = require("express");
const router = express.Router();
const db = require("../models/db.js");
const middleware = require("../middleware/index.js");

router.get("/petition", middleware.requireSession, function(req, res) {
    var scripts = [{ script: "/js/main.js" }];
    res.render("petition-sign", {
        scripts: scripts,
        user: req.session.user,
    });
});

router.post("/petition", function(req, res) {
    let query = "INSERT INTO signatures (id, first, last, signature) VALUES ($1, $2, $3, $4)";

    db
        .query(query, [req.session.user.id, req.body.first, req.body.last, req.body.hiddensig])
        .then(results => {
            req.session.user.signed = true;
            res.redirect("/thanks");
        })
        .catch(err => {
            console.error("query error", err.message, err.stack);
        });
});

router.get("/thanks", (req, res) => {
    let query = "SELECT * FROM signatures WHERE id=$1";

    db
        .query(query, [req.session.user.id])
        .then(results => {
            res.render("petition-thanks", {
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

router.get("/signers", middleware.requireSession, (req, res) => {
    let query = "SELECT first, last FROM signatures";

    db
        .query(query)
        .then(results => {
            res.render("petition-signers", {
                results: results.rows,
            });
        })
        .catch(e => {
            console.error("query error", e.message, e.stack);
        });
});

module.exports = router;
