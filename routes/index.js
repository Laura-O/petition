const express = require("express");
const router = express.Router();

router.get("/", function(req, res) {
    res.render("petition-main", { user: req.session.user });
});

router.get("/clearcookie", function(req, res) {
    res.clearCookie("signed");
    res.clearCookie("session");
    res.clearCookie("session.sig");
    req.session = null;
    res.send("Cookie deleted");
});

module.exports = router;
