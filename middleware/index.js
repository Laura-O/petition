function requireSession(req, res, next) {
    if (!req.session.user) {
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
            res.redirect("/petition");
        }
    } else {
        res.redirect("/register");
    }
}

module.exports = {
    requireSession,
    requireSigned,
};
