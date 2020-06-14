//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs"); // eslint-disable-line

const app = express();

app.use(expre.static("public"));
app.set('view engine'. 'ejs');
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





app.listen(port, function () {
    console.log(`Server started at: http://localhost:${port}`);
  });
