const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const Blog = require("./blogModel");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   MongoDB
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* =========================
   Cloudinary Config
========================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* =========================
   Multer Cloudinary Storage
========================= */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blogs",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

/* =========================
   ROUTES
========================= */

/* ➕ Create Blog */
app.post("/api/blogs", upload.single("image"), async (req, res) => {
  try {
    const blog = new Blog({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      image: req.file ? req.file.path : "",
    });

    await blog.save();
    res.json({ message: "Blog created", blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* 📥 Get All Blogs */
app.get("/api/blogs", async (req, res) => {
  const blogs = await Blog.find().sort({ date: -1 });
  res.json(blogs);
});

/* 📄 Get Single Blog */
app.get("/api/blogs/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.json(blog);
});

/* ✏ Update Blog */
app.put("/api/blogs/:id", upload.single("image"), async (req, res) => {
  try {
    const updatedData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
    };

    if (req.file) {
      updatedData.image = req.file.path;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json({ message: "Blog updated", updatedBlog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* 🗑 Delete Blog */
app.delete("/api/blogs/:id", async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ message: "Blog deleted" });
});

app.listen(5000, () => console.log("Server running on port 5000"));
