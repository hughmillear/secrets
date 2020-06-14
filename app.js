//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs"); // eslint-disable-line

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

let port = process.env.PORT;
if (port == null || port == "") {
  if (process.platform === "linux") {
    port = 3001;
  } else {
    port = 3000;
  }
}


app.get("/", function(req, res) {
    res.render("home");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});



app.listen(port, function () {
    console.log(`Server started at: http://localhost:${port}`);
  });
