const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const todo = require("./models/tasks");
const bcrypt = require("bcrypt");
const session = require("express-session");

const User = require("./models/user");

app.set("view engine", "ejs");
app.set(path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "views")));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: "frozen hands",
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true },
  })
);

mongoose
  .connect("mongodb://localhost:27017/todo-list", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("MONGO CONNECTION OPEN!!!");
  })
  .catch((err) => {
    console.log("OH NO MONGO CONNECTION ERROR!!!!");
    console.log(err);
  });

const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/app", requireLogin, async (req, res) => {
  const task = await todo.find({});
  res.render("todo", { task });
});

// POST ROUTE
app.post("/app", requireLogin, async (req, res) => {
  try {
    const task = req.body;
    const newTask = new todo({ task: task.task });
    await newTask.save();
    res.redirect("/app");
  } catch (err) {
    res.send("Something went wrong");
  }
});

// Edit Task render form
app.get("/app/:id/edit", requireLogin, async (req, res) => {
  try {
    const task = await todo.findOne({ _id: req.params.id });
    res.render("todoEdit", { task });
  } catch (err) {
    res.send("something went wrong");
  }
});

// Edit task handle post request
app.put("/app/:id", requireLogin, async (req, res) => {
  try {
    const id = req.params.id;
    const newTask = await todo.findByIdAndUpdate(
      id,
      { task: req.body.task },
      { runValidators: true }
    );
    res.redirect("/app");
  } catch (err) {
    res.send("Something went wrong");
  }
});

// Delete task
app.delete("/app/:id", requireLogin, async (req, res) => {
  try {
    const id = req.params.id;
    const deleteTask = await todo.findByIdAndDelete(id);
    res.redirect("/app");
  } catch (err) {
    res.send("something went wrong");
  }
});

app.get("/register", (req, res) => {
  res.render("users/register");
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 12);

    const user = new User({
      username,
      password: hash,
    });

    await user.save();
    req.session.user_id = user._id;
    res.redirect("/");
  } catch (err) {
    res.send("Something went wrong!");
  }
});

app.get("/login", (req, res) => {
  res.render("users/login");
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.redirect("/app");
    }
    req.session.user_id = user._id;
    res.redirect("/app");
  } catch (err) {
    res.send("Something went wrong");
  }
});

app.post("/logout", (req, res) => {
  // req.session.user_id = null;
  req.session.destroy();
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server Up and running!");
});
