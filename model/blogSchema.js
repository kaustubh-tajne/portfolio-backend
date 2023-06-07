const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: false
    },
    desc: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: false,
      default: "",
    }
  },
  { timestamps: true }
);

const Post = mongoose.model("POST", blogSchema);

module.exports = Post;
