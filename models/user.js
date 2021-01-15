const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: [true, "username cannot be blank"] },
  password: { type: String, required: [true, "Password is required"] },
});

module.exports = mongoose.model("User", userSchema);
