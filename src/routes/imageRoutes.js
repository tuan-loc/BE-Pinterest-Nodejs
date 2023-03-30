const express = require("express");
const imageRoutes = express.Router();
const imageController = require("../controllers/imageController");
const multer = require("multer");
const { authenticate } = require("../middlewares/authentication");

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

imageRoutes.get("/lay-danh-sach-anh", imageController.getImage);
imageRoutes.get("/tim-kiem-anh", imageController.searchImage);
imageRoutes.get("/lay-thong-tin-anh", imageController.getInforImage);
imageRoutes.get("/lay-thong-tin-binh-luan", imageController.getComment);
imageRoutes.post("/binh-luan", authenticate, imageController.commentImage);
imageRoutes.post("/luu-anh", authenticate, imageController.saveImage);
imageRoutes.delete("/huy-luu-anh", authenticate, imageController.unsaveImage);
imageRoutes.get(
  "/lay-thong-tin-luu-anh",
  authenticate,
  imageController.getSavedImage
);
imageRoutes.post(
  "/them-anh",
  authenticate,
  upload.single("file"),
  imageController.addImage
);
imageRoutes.get(
  "/lay-danh-sach-anh-da-tao",
  imageController.getImageListCreated
);
imageRoutes.get("/lay-danh-sach-anh-da-luu", imageController.getImageListSaved);
imageRoutes.delete("/xoa-anh", authenticate, imageController.deleteImage);

module.exports = imageRoutes;
