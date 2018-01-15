function requireSession(req, res, next) {
    if (!req.session.user) {
        req.flash("info", "You have to register first!");
        res.redirect("/register");
    } else {
        next();
    }
}

function requireSigned(req, res, next) {
    if (req.session.user) {
        if (req.session.user.signed) {
            next();
        } else {
            req.flash("info", "You have to sign the petition first!");
            res.redirect("/petition");
        }
    } else {
        req.flash("info", "You have to register first!");
        res.redirect("/register");
    }
}

module.exports = {
    requireSession,
    requireSigned,
};
