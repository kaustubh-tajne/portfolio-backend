const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { cloudinary } = require("../utils/cloudinary");
const Authenticate = require("../middleware/authenticate");

const User = require("../model/userSchema");
const Project = require("../model/projectSchema");
const Post = require("../model/blogSchema");
const { find } = require("../model/userSchema");

router.get("/", (req, res) => {
  console.log("home");
  res.send("<h1>Hello</h1>");
});

router.get("/project", Authenticate, async (req, res) => {
  try {
    const data = await Project.find();
    // console.log(data);
    // 62760d89cb830c75f6a5a221
    const adminEmail = "kaustubhtajne12@gmail.com";
    // console.log(req._id);

    // console.log(req.rootUser);
    // console.log(req.email);
    if (req.cookies.jwtokenport && adminEmail === req.rootUser.email) {
      return res.status(210).send(data);
    }

    res.status(200).send(data);
  } catch (error) {
    console.log(error.message);
  }
});

router.post("/api/upload", async (req, res) => {
  try {
    // console.log("ffdsds");
    const filStr = req.body.data;
    const { title, description, tags, visit, code } = req.body.user;
    const uploadResponse = await cloudinary.uploader.upload(filStr, {
      upload_preset: "portfolio_projects",
    });

    const image = uploadResponse.secure_url;

    // console.log(uploadResponse);
    const infoUpload = new Project({
      title,
      description,
      image,
      tags,
      visit,
      code,
    });

    const data = await infoUpload.save();
    // console.log(data);

    res.json({ mess: data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ err: error.message });
  }
});

router.get("/blogs", (req, res) => {
  res.send("<h1>blogs</h1>");
});

router.get("/contact", Authenticate, (req, res) => {
  //   console.log("contact");

  if (req.cookies.jwtokenport) {
    return res.status(200).send(req.rootUser);
  }

  res.status(400).json({ err: "not found" });
});

router.post("/contacts", Authenticate, async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    const userContact = await User.findOne({ _id: req.rootUser._id });

    if (!userContact) {
      return res.status(404).json({ err: "User not found" });
    }

    const userMessage = await userContact.addMessage(
      name,
      email,
      phone,
      message
    );

    await userContact.save();

    res.status(201).json({ mess: "Message added successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ err: "Please fill the info properly" });
  }

  try {
    const userLogin = await User.findOne({ email: email });

    if (!userLogin) {
      return res.status(422).json({ err: "User does not exits" });
    }

    const token = await userLogin.generateToken();
    // console.log(token);

    res.cookie("jwtokenport", token, {
      expires: new Date(Date.now() + 86400000),
      httpOnly: true,
    });

    const isMatch = await bcrypt.compare(password, userLogin.password);

    if (!isMatch) {
      return res.status(401).json({ err: "Password not matching" });
    }

    res.status(200).json({ mess: "Login Successful" });
  } catch (error) {
    res.status(422).json({ err: error.message });
  }
});


router.post("/register", async (req, res) => {
  const { name, email, phone, password, cpassword } = req.body;
  // console.log(req.body);

  // console.log(phone);

  if (!name || !email || !password || !cpassword) {
    return res.status(422).json({ err: "Please fill the info properly" });
  }

  try {
    const userExits = await User.findOne({ email: email });
    if (userExits) {
      // console.log("User already exits");
      return res.status(422).json({ err: "User already exits" });
    }

    const user = new User({ name, email, phone, password, cpassword });
    // console.log(user);
    const data = await user.save();

    // console.log(data);

    res.status(201).json({ mess: "User created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: error.message });
  }
});

router.get("/logout", (req, res) => {
  // console.log("user logout");
  res.clearCookie("jwtokenport", { path: "/" });
  res.status(200).json({ mess: "User Logout" });
});



// Blogging Section

// Create Post
router.post("/api/posts", async (req, res) => {
  const filStr = req.body.data;
  const { title, desc } = req.body.writeInfo;

  const uploadResponse = await cloudinary.uploader.upload(filStr, {
    upload_preset: "portfolio_projects",
  });

  // console.log(uploadResponse);
  const photo = uploadResponse.secure_url;

  const newPost = new Post({ title, desc, photo });

  try {
    const savedPost = await newPost.save();
    // console.log(savedPost);
    res.status(201).json(savedPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: error.message });
  }
});

// Get All Post

router.get("/api/posts", async (req, res) => {
  const username = req.query.user;
  const catName = req.query.cat;
  try {
    let posts;

    if (username) {
      posts = await Post.find({ username: username });
    } else if (catName) {
      posts = await Post.find({
        categories: {
          $in: [catName],
        },
      });
    } else {
      posts = await Post.find();
    }

    res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ err: error });
  }
});

// Get Post by Id

router.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // console.log(post);
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ err: error });
  }
});

// Update Post
router.put("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    try {
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );

      // console.log(updatedPost);
      res.status(201).json(updatedPost);
    } catch (error) {
      res.status(500).json({ err: error });
    }
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

// Delete Post
router.delete("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(401).json({ err: "Post not found.." });
    }

    try {
      await post.delete();

      res.status(201).json("Post have been deleted..");
    } catch (error) {
      res.status(500).json({ err: error });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ err: error });
  }
});

router.get('/projects/demo', async (req,res) => {
  const catName = req.query.cat;
  try {
    const data = await Project.findOne({title : catName});
    // console.log(data);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
})
router.delete('/projects/demo/', async (req,res) => {
  const catName = req.query.cat;
  try {
    const data = await Project.findOneAndDelete({title : catName});
    // console.log(data);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
})

const Achieve = require('../model/Achieve');

router.get('/api/box' , async (req,res) => {
  try {
    const data = await Achieve.find();
    // console.log(data);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
})

router.post('/api/box' , async (req,res) => {  
  const box = new Achieve(req.body);
  
  try {
    const data = await box.save();
    // console.log(data);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
})

module.exports = router;
