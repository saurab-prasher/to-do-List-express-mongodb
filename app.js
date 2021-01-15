const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const todo = require("./models/tasks");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "views")));
app.use(methodOverride("_method"));

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

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/", async (req, res) => {
  const task = await todo.find({});
  res.render("todo", { task });
});

// POST ROUTE
app.post("/", async (req, res) => {
  try {
    const task = req.body;
    const newTask = new todo({ task: task.task });
    await newTask.save();
    res.redirect("/");
  } catch (err) {
    res.send("Something went wrong");
  }
});

// Edit Task render form
app.get("/:id/edit", async (req, res) => {
  try {
    const task = await todo.findOne({ _id: req.params.id });
    res.render("todoEdit", { task });
  } catch (err) {
    res.send("something went wrong");
  }
});

// Edit task handle post request
app.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const newTask = await todo.findByIdAndUpdate(
      id,
      { task: req.body.task },
      { runValidators: true }
    );
    res.redirect("/");
  } catch (err) {
    res.send("Something went wrong");
  }
});

// Delete task
app.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleteTask = await todo.findByIdAndDelete(id);
    res.redirect("/");
  } catch (err) {
    res.send("something went wrong");
  }
});

app.listen(3000, () => {
  console.log("Server Up and running!");
});
