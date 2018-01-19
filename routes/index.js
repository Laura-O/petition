const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("main", {
        user: req.session.user,
        error: req.flash("error"),
        info: req.flash("info")
    });
});

// Removes session, only for development
router.get("/clearsession", (req, res) => {
    req.session.destroy();
    res.send("Cookie deleted");
});

module.exports = router;
