const express = require("express");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
const csrf = require("csurf");
const bodyParser = require("body-parser");

const db = require("./models/db.js");

const authRoutes = require("./routes/auth.js");
const petitionRoutes = require("./routes/sign.js");
const indexRoutes = require("./routes/index.js");
const userRoutes = require("./routes/user.js");

var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

let hbs = exphbs.create({
    defaultLayout: "main",
    helpers: {}
});

const app = express();
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());

app.use(
    cookieSession({
        name: "session",
        keys: ["key1", "key2"]
    })
);

app.use("/styles", express.static(__dirname + "/styles"));
app.use("/js", express.static(__dirname + "/js"));
app.use("/assets", express.static(__dirname + "/assets"));

app.get("/flash", (req, res) => {
    req.flash("info", "Flash is back!");
    res.redirect("/");
});

app.use(authRoutes);
app.use(petitionRoutes);
app.use(indexRoutes);
app.use(userRoutes);

app.listen(process.env.PORT || 8080, () => {
    console.log("Listening on 8080");
});
