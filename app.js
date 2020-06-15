//jshint esversion:6

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs"); // eslint-disable-line
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

let port = process.env.PORT;
if (port == null || port == "") {
  if (process.platform === "linux") {
    port = 3001;
  } else {
    port = 3000;
  }
}

app.use(
  session({
    secret: process.env.SECRET_STRING,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

let table_name = "userDB";

let node_env = process.env.NODE_ENV || "development";
console.log(`node_env = ${node_env}`);
if (node_env === "production") {
  mongoose.connect(
    `mongodb+srv://${process.env.ATLAS_USER}:${process.env.ATLAS_PW}@${process.env.ATLAS_URI}/${table_name}`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  );
} else {
  mongoose.connect(`mongodb://localhost:27017/${table_name}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.post("/register", function (req, res) {
  User.register({ username: req.body.username }, req.body.password, function (
    err,
    user
  ) {
    if (err) {
      console.log(err);
      return res.redirect("/register");
    }
    console.log(`user: ${user}`);
    passport.authenticate("local")(req, res, function () {
      res.redirect("/secrets");
    });
  });
});

// app.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: "/secrets",
//     failureRedirect: "/login",
//   })
// );

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
      console.log(`Failed login for user: ${req.body.username}`);
      res.redirect("/login");
    } else {
      console.log(`Succesful login for user: ${req.body.username}`);
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.listen(port, function () {
  console.log(`Server started at: http://localhost:${port}`);
});
