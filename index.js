const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const pg = require("pg");
const Pool = require("pg-pool");
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

app.get("/petition", function(req, res) {
    console.log(req.cookies);
    var scripts = [{ script: "/js/main.js" }];
    res.render("petition-sign", {
        css: "styles.css",
        scripts: scripts,
    });
});

app.post("/petition", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    let query = "INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id";

    pool.connect().then(client => {
        client
            .query(query, [req.body.first, req.body.last, req.body.hiddensig])
            .then(results => {
                req.session.signatureId = results;
                res.redirect("/thanks");
                client.release();
            })
            .catch(e => {
                client.release();
                console.error("query error", e.message, e.stack);
            });
    });
});

app.get("/thanks", function(req, res) {
    res.render("petition-thanks", {
        css: "styles.css",
    });
});

app.get("/clearcookie", function(req, res) {
    clearCookie("cookie_name");
    res.send("Cookie deleted");
});

app.listen(8080, function() {
    console.log("Listening on 8080");
});

app.get("/signers", (req, res) => {
    let query = "SELECT first, last FROM signatures";

    pool.connect().then(client => {
        client
            .query(query)
            .then(results => {
                console.log(results);
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
