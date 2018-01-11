const express = require("express");
const app = express();
const hb = require("express-handlebars");
const bodyParser = require("body-parser");
const pg = require("pg");
const Pool = require("pg-pool");
// const client = new pg.Client("postgres://localhost:5432/petition");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

const config = {
    host: "localhost",
    port: 5432,
    database: "petition",
};

const pool = new Pool(config);
pool.on("error", function(err) {
    console.log(err);
});

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    cookieSession({
        secret: "very secret string",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }),
);

app.get("/petition", function(req, res) {
    res.render("petition-sign", {
        layout: "layout",
        css: "styles.css",
    });
});

app.post("/petition", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    let query = "INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id";

    pool.query(query, [req.body.firstName, req.body.lastName, req.body.signature], function(
        err,
        results,
    ) {
        if (err) {
            console.log(err);
        } else {
            req.session.signatureId = results;
            res.redirect("/thanks");
        }
    });
});

app.get("/thanks", function(req, res) {
    res.render("petition-thanks", {
        layout: "layout",
        css: "styles.css",
    });
});

app.get("/signers", function(req, res) {
    getSigners(function(err, results) {
        if (err) {
            console.log(err);
        } else {
            res.render("petition-signers", {
                layout: "layout",
                css: "styles.css",
                results: results,
            });
        }
    });
});

app.listen(8080, function() {
    console.log("Listening on 8080");
});

function getSigners(callback) {
    let query = "SELECT first, last FROM signatures";

    pool.query(query, function(err, results) {
        if (err) {
            console.log(err);
        } else {
            callback(null, results.rows);
        }
    });
}
