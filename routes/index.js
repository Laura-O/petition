const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("main", {
        user: req.session.user,
        error: req.flash("error"),
        info: req.flash("info"),
    });
});

router.get("/clearcookie", (req, res) => {
    req.session = null;
    res.send("Cookie deleted");
});

module.exports = router;
