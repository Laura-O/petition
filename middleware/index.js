function requireSession(req, res, next) {
    if (!req.session.user) {
        res.redirect("/register");
    } else {
        next();
    }
}

function requireSigned(req, res, next) {
    if (!req.session.user.signed) {
        res.redirect("/petition");
    } else {
        next();
    }
}

module.exports = {
    requireSession,
    requireSigned,
};
