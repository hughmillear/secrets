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
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const FacebookStrategy = require("passport-facebook").Strategy;

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
  port = 3000;
}

app.use(
  session({
    secret: process.env.SECRET_STRING,
    resave: true,
    saveUninitialized: false,
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
  authId: String,
  secret: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo", // was needed in early 2019 around end of Gplus
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      User.findOrCreate(
        {
          authId: profile.id,
          username: profile.displayName,
        },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      User.findOrCreate(
        {
          authId: profile.id,
          username: profile.displayName,
        },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

app.get("/", function (req, res) {
  res.render("home");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/secrets");
  }
);

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/secrets",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/secrets");
  }
);

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/secrets", function (req, res) {
  User.find({ secret: { $ne: null } }, function (err, foundUsers) {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      if (foundUsers) {
        res.render("secrets", { usersWithSecrets: foundUsers });
      }
    }
  });
});

app.get("/submit", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

app.post("/submit", function (req, res) {
  const submittedSecret = req.body.secret;
  console.log(req.user);
  User.findById(req.user._id, function (err, foundUser) {
    if (err) {
      console.log(err);
      res.redirect("/submit");
    } else {
      if (foundUser) {
        foundUser.secret = submittedSecret;
        foundUser.save(function () {
          res.redirect("/secrets");
        });
      }
    }
  });
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
