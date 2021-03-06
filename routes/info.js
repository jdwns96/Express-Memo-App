const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const User = require("../models/user");

const router = express.Router();

try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/"); // uploads 폴더에 이미지 저장을 할것이다.
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext); //덮어 씌우기를 막기위해 날짜이름
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/img", isLoggedIn, upload.single("img"), async (req, res) => {
  console.log(req.file);
  await User.update(
    { img: `/img/${req.file.filename}` },
    { where: { id: req.user.id } }
  );
  res.status(201).end();
});

module.exports = router;
