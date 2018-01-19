const express = require("express");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth.js");
const petitionRoutes = require("./routes/sign.js");
const indexRoutes = require("./routes/index.js");
const userRoutes = require("./routes/user.js");
const session = require("express-session");
const Store = require("connect-redis")(session);

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

let store = {};
if (process.env.REDIS_URL) {
    store = {
        url: process.env.REDIS_URL
    };
} else {
    store = {
        ttl: 3600, //time to live
        host: "localhost",
        port: 6379
    };
}

app.use(cookieParser());
app.use(
    session({
        store: new Store(store),
        resave: true,
        saveUninitialized: true,
        secret: "my super fun secret"
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
