const express = require("express");
const router = express.Router();

router.get("/", function(req, res) {
    res.render("main", {
        user: req.session.user,
        error: req.flash("error"),
        info: req.flash("info"),
    });
});

router.get("/clearcookie", function(req, res) {
    res.clearCookie("signed");
    res.clearCookie("session");
    res.clearCookie("session.sig");
    req.session = null;
    res.send("Cookie deleted");
});

module.exports = router;
