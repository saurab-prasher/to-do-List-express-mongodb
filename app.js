const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "views")));
app.use(methodOverride("_method"));

mongoose
  .connect("mongodb://localhost:27017/todo-list", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MONGO CONNECTION OPEN!!!");
  })
  .catch((err) => {
    console.log("OH NO MONGO CONNECTION ERROR!!!!");
    console.log(err);
  });

const todoSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true,
  },
});

const Todo = mongoose.model("Todo", todoSchema);

app.get("/", async (req, res) => {
  const task = await Todo.find({});
  res.render("todo", { task });
});

// POST ROUTE
app.post("/", async (req, res) => {
  try {
    const task = req.body;
    const newTask = new Todo({ task: task.content });
    await newTask.save();
    res.redirect("/");
  } catch (err) {
    res.send("Something went wrong");
  }
});

app.get("/:id/edit", async (req, res) => {
  try {
    const id = req.params.id;
    const task = await Todo.find({});
    res.render("todoEdit", { task, idTask: id });
  } catch (err) {
    res.send("something went wrong");
  }
});

app.put("/edit/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const newTask = await Todo.findByIdAndUpdate(
      id,
      { task: req.body.content },
      { runValidators: true }
    );
    res.redirect("/");
  } catch (err) {
    res.send("Something went wrong");
  }
});

app.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleteTask = await Todo.findByIdAndDelete(id);
    res.redirect("/");
  } catch (err) {
    res.send("something went wrong");
  }
});

app.listen(3000, () => {
  console.log("Server Up and running!");
});
