const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const db = require("./models/db.js");
const user = require("./models/user.js");

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

app.get("/petition", requireSession, function(req, res) {
    console.log(req.session.user);
    var scripts = [{ script: "/js/main.js" }];
    res.render("petition-sign", {
        css: "styles.css",
        scripts: scripts,
        user: {
            first: req.session.user.first,
            last: req.session.user.last,
        },
    });
});

app.post("/petition", function(req, res) {
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

app.get("/register", (req, res) => {
    res.render("petition-register", {
        css: "styles.css",
    });
});

app.post("/register", (req, res) => {
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

app.get("/login", (req, res) => {
    res.render("petition-login", {
        css: "styles.css",
    });
});

app.post("/login", (req, res) => {
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

app.post("/logout", (req, res) => {
    console.log("post");
    req.session = null;
    res.redirect("/petition");
});

app.get("/thanks", (req, res) => {
    let query = "SELECT * FROM signatures WHERE id=$1";

    db
        .query(query, [req.session.user.id])
        .then(results => {
            res.render("petition-thanks", {
                img: results.rows[0].signature,
                css: "styles.css",
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

app.get("/signers", requireSession, (req, res) => {
    let query = "SELECT first, last FROM signatures";

    db
        .query(query)
        .then(results => {
            res.render("petition-signers", {
                css: "styles.css",
                results: results.rows,
            });
        })
        .catch(e => {
            console.error("query error", e.message, e.stack);
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

function requireSession(req, res, next) {
    if (!req.session.user) {
        res.redirect("/register");
    } else {
        next();
    }
}

function requireSigned(req, res, next) {
    if (!req.session.user || req.session.user.signed === false) {
        res.redirect("/petition");
    } else {
        next();
    }
}
