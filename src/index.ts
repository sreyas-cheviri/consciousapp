import express from "express";
import jwt from "jsonwebtoken";
import z from "zod";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { UserModel, ContentModel, LinkModel } from "./db";
import dotenv from "dotenv";
import { auth } from "./middleware";
import { random } from "./utils";
import cors from "cors";
dotenv.config();

const app = express();

app.use(cors());

const port = process.env.PORT || 3000;

app.use(express.json());

const dbconnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("connected to db");
    app.listen(port, () => {
      console.log(`server is running on port ${port}`);
    });
  } catch (error) {
    console.log("error connecting to db");
    console.log(error);

    process.exit(1);
  }
};

dbconnect();

// -------------------signup-------------------

app.post("/api/v1/signup", async (req, res) => {
  const inputzod = z.object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long " })
      .max(20, { message: "Username must be at most 20 characters long" }),

    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long " })
      .max(20, { message: "Password must be at most 20 characters long" })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: "Password must contain at least one special character",
      }),
  });

  const validInput = inputzod.safeParse(req.body);
  if (!validInput.success) {
    const errorMessage = validInput.error.errors.map((e) => e.message);
    res.status(411).json({
      message: errorMessage || "Invalid format",
      error: errorMessage,
    });
    return;
  }

  const { username, password } = req.body;
  const hashpassword = await bcrypt.hash(password, 10);
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      await UserModel.create({ username, password: hashpassword });
    } else {
      res.status(500).json({ message: "User name is taken" });
      return;
    }
    res.status(200).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});
//----------guest --

// function generateGuestToken() {
//   return jwt.sign(
//     { role: "guest", userId: `guest_${Date.now()}` },
//     process.env.JWT_SECRET as string,
//     { expiresIn: "1h" } // Token valid for 1 hour
//   );
// }

// app.post("/api/v1/guest",async (req,res)=>{
//   try {
//     const token =  generateGuestToken();
//     res.json({token , username: "Guest"})
//   } catch (error) {
//     res.status(500).json({message: "Guest login failed"})
//   }
// })

// -------------------signin-------------------

app.post("/api/v1/signin", async (req, res) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({ username });
  if (!user) {
    res.status(404).json({ message: "user not found" });
    return;
  }
  if (user === null) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }
  if (user.password) {
    try {
      const hashpassword = await bcrypt.compare(password, user.password);
      if (hashpassword) {
        if (user._id) {
          const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "7days" }
          );
          res.status(200).json({ message: "User logged in successfully", token, username });
        }
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// -------------------coontent add-------------------

app.post("/api/v1/content", auth, async (req, res) => {
  const { link, title, type, content } = req.body;
  try {
    await ContentModel.create({
      title: title,
      link: link,
      type: type,
      content: content,
      tag: [],
      userId: req.userId,
    });
    res.status(200).json({ message: "content added successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// -------------------content get-------------------

app.get("/api/v1/content", auth, async (req, res) => {
  const userId = req.userId;
  try {
    const content = await ContentModel.find({ userId: userId }).populate(
      "userId",
      "username"
    );
    if (content.length == 0) {
      res.json({
        content: [
          {
            _id: "default-1",
            type: "Note",
            title: "Welcome to  Conscious!",
            content:
              "This is your default content. Start exploring now! click on Add Memory to add more content",
          },
        ],
      });
      return;
    }
    res.status(200).json({ content });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

// -------------------content delete-------------------

app.delete("/api/v1/content/:contentId", auth, async (req, res) => {
  const { contentId } = req.params;

  if (!contentId || !mongoose.Types.ObjectId.isValid(contentId)) {
    res.status(400).json({ error: "Invalid or missing content ID" });
    return;
  }

  await ContentModel.deleteOne({ _id: contentId, userId: req.userId });

  res.json({ message: "Content deleted successfully" });
  return;
});

app.post("/api/v1/brain/share", auth, async (req, res) => {
  const share = req.body.share;
  if (share) {
    const content = await LinkModel.findOne({ userId: req.userId });
    if (content) {
      res.json({ hash: content.hash });
      return;
    }
    const hash = random(10);
    await LinkModel.create({
      userId: req.userId,
      hash: hash,
    });

    res.json({
      hash,
    });
  } else {
    await LinkModel.deleteOne({
      userId: req.userId,
    });

    res.json({
      message: "Removed link",
    });
  }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;

  const link = await LinkModel.findOne({
    hash,
  });

  if (!link) {
    res.status(411).json({
      message: "Sorry incorrect input",
    });
    return;
  }
  // userId
  const content = await ContentModel.find({
    userId: link.userId,
  });

  // console.log(link);
  const user = await UserModel.findOne({
    _id: link.userId,
  });

  if (!user) {
    res.status(411).json({
      message: "user not found, error should ideally not happen",
    });
    return;
  }

  res.json({
    username: user.username,
    content: content,
  });
});
