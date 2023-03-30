const express = require("express");

const rootRouter = express.Router();

rootRouter.use("/quan-ly-nguoi-dung", require("./userRoutes"));
rootRouter.use("/quan-ly-hinh-anh", require("./imageRoutes"));

module.exports = rootRouter;
