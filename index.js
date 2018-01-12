const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const pool = require("./db.js");

let hbs = exphbs.create({
    defaultLayout: "main",
    helpers: {},
});

const app = express();
app.engine("handlebars", hbs.engine);
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

app.get("/", function(req, res) {
    res.redirect("/petition");
});

app.get("/petition", function(req, res) {
    console.log(req.cookies);
    var scripts = [{ script: "/js/main.js" }];
    res.render("petition-sign", {
        css: "styles.css",
        scripts: scripts,
    });
});

app.post("/petition", function(req, res) {
    let query = "INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id";

    pool.connect().then(client => {
        client
            .query(query, [req.body.first, req.body.last, req.body.hiddensig])
            .then(results => {
                req.session.sigId = results.rows[0].id;
                res.cookie("signed", "signed", {
                    httpOnly: true,
                });
                console.log(req.body);
                res.render("petition-thanks", {
                    data: req.body,
                    css: "styles.css",
                });
                client.release();
            })
            .catch(err => {
                client.release();
                console.error("query error", err.message, err.stack);
            });
    });
});

app.get("/register", (req, res) => {
    res.render("petition-register", {
        css: "styles.css",
    });
});

app.get("/login", (req, res) => {
    res.render("petition-login", {
        css: "styles.css",
    });
});

app.get("/thanks", requireSignature, (req, res) => {
    console.log(req.session.sigId);

    let query = "SELECT * FROM signatures WHERE id=$1";
    pool.connect().then(client => {
        client
            .query(query, [req.session.sigId])
            .then(results => {
                res.render("petition-thanks", {
                    img: results.rows[0].signature,
                    css: "styles.css",
                });
                client.release();
            })
            .catch(err => {
                client.release();
                console.error("query error", err.message, err.stack);
            });
    });
});

app.get("/clearcookie", function(req, res) {
    res.clearCookie("signed");
    res.clearCookie("session");
    res.clearCookie("session.sig");
    req.session = null;
    res.send("Cookie deleted");
});

app.listen(8080, function() {
    console.log("Listening on 8080");
});

app.get("/signers", requireSignature, (req, res) => {
    let query = "SELECT first, last FROM signatures";

    pool.connect().then(client => {
        client
            .query(query)
            .then(results => {
                res.render("petition-signers", {
                    css: "styles.css",
                    results: results.rows,
                });
                client.release();
            })
            .catch(e => {
                client.release();
                console.error("query error", e.message, e.stack);
            });
    });
});

function requireSignature(req, res, next) {
    if (!req.cookies.signed) {
        res.redirect("/petition");
    } else {
        next();
    }
}

function checkAuth(req, res, next) {}
