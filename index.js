const express = require("express");
const app = express();
const hb = require("express-handlebars");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(express.static("public"));

app.get("/petition", function(req, res) {
    res.render("petition", {
        layout: "layout",
        css: "styles.css",
    });
});

// app.push("/petition", function(res, req) {
//     db.signPetition(req.body.first, req.body.last, req.body.sig).catch(function() {
//         res.render("petition", {
//             error: true,
//         });
//     });
// });

function signPetition() {
    console.log("bla");
}

app.listen(8080, function() {
    console.log("Listening on 8080");
});
