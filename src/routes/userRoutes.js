const express = require("express");
const userRoutes = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middlewares/authentication");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${process.cwd()}/public/images`);
  },
  filename: (req, file, cb) => {
    const d = new Date();
    const newName = d.getTime() + "_" + file.originalname;
    cb(null, newName);
  },
});
const upload = multer({ storage });

userRoutes.post("/dang-ky", upload.single("file"), userController.register);
userRoutes.post("/dang-nhap", userController.login);
userRoutes.get("/lay-thong-tin-nguoi-dung", userController.getInforUser);
userRoutes.put(
  "/chinh-sua-thong-tin-nguoi-dung",
  authenticate,
  upload.single("file"),
  userController.editInforUser
);

module.exports = userRoutes;
