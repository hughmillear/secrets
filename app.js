//jshint esversion:6

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs"); // eslint-disable-line
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.static("public"));
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

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      const newUser = new User({
        email: req.body.username,
        password: hash,
      });

      newUser.save(function (err) {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res.render("secrets");
        }
      });
    }
  });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function (err, result) {
          if (err) {
            console.log(err);
            res.sendStatus(500);
          } else {
            console.log(result);
            if (result === true) {
              res.render("secrets");
            } else {
              console.log("wrong password");
              res.redirect("/login");
            }
          }
        });
      }
    }
  });
});

app.listen(port, function () {
  console.log(`Server started at: http://localhost:${port}`);
});
