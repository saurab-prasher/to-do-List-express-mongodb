const express = require("express");
const app = express();
const path = require("path");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "views")));

app.get("/", (req, res) => {
  res.render("todo");
});

app.listen(3000, () => {
  console.log("Server Up and running!");
});
