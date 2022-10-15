const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const auth = require("../middleware/auth");
const sharp = require("sharp");
const multer = require("multer");
const { sendWelcomEmail, sendGoodbyEmail } = require("../emails/account");
const avatar = multer({
  limits: {
    fileSize: 1_000_000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("file must be an .jpg .jpeg or .png image"));
    }
    cb(undefined, true);
  },
});

// read
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error("user doesnot exist or has no avatar");
    }

    res.set("content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(400).send();
  }
});

// create
router.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const token = await user.generateAuthToken();

    await user.save();
    sendWelcomEmail(user.email, user.name);
    res.status(201).send({ user, token });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.post(
  "/users/me/avatar",
  auth,
  avatar.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.password,
      req.body.email
    );

    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (error) {
    res.status(400).send("unable to connect");
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token !== req.token);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

// update
router.patch("/users/me", auth, async (req, res) => {
  const updateKeys = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidUpdate = updateKeys.every((key) => {
    return allowedUpdates.includes(key);
  });

  if (!isValidUpdate) {
    return res.status(400).send({ error: "invalid update" });
  }

  try {
    updateKeys.forEach(
      (updateKey) => (req.user[updateKey] = req.body[updateKey])
    );

    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// delete
router.delete("/users/me", auth, async (req, res) => {
  try {
    req.user.remove();
    sendGoodbyEmail(req.user.email, req.user.name);

    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

module.exports = router;
