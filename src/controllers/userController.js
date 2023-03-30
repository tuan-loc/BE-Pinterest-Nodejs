const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { generateToken } = require("../utils/jwt");
const { ResponseSuccess, ResponseError } = require("../utils/response");

const model = new PrismaClient();

const register = async (req, res) => {
  try {
    const { email, matKhau, hoTen, tuoi } = req.body;

    const errors = {};
    if (!email || !matKhau || !hoTen || !tuoi) {
      if (!email) errors.email = "Email không được bỏ trống.";
      if (!matKhau) errors.matKhau = "Mật khẩu không được bỏ trống.";
      if (!hoTen) errors.hoTen = "Họ tên không được bỏ trống.";
      if (!tuoi) errors.tuoi = "Tuổi không được bỏ trống.";
      return res.json(ResponseError(400, errors, errors));
    }

    if (matKhau.length < 6)
      return res.json(
        ResponseError(
          400,
          ["Mật khẩu ít nhất 6 ký tự."],
          "Mật khẩu ít nhất 6 ký tự."
        )
      );

    const isEmailExists = await model.nguoi_dung.findFirst({
      where: { email },
    });

    if (isEmailExists) {
      return res.json(
        ResponseError(400, ["Email đã tồn tại."], "Email đã tồn tại.")
      );
    }

    let hashPassword = bcrypt.hashSync(matKhau, 10);
    let data = {
      email,
      mat_khau: hashPassword,
      ho_ten: hoTen,
      tuoi: tuoi,
      anh_dai_dien: req.file ? req.file.filename : "default-avatar.jpg",
    };

    await model.nguoi_dung.create({ data });
    return res.json(
      ResponseSuccess(201, { email, hoTen, tuoi }, "User create!")
    );
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const login = async (req, res) => {
  try {
    const { email, matKhau } = req.body;
    const errors = {};
    if (!email || !matKhau) {
      if (!email) errors.email = "Email không được bỏ trống.";
      if (!matKhau) errors.matKhau = "Mật khẩu không được bỏ trống.";
      return res.json(ResponseError(400, errors, errors));
    }

    const user = await model.nguoi_dung.findFirst({
      where: { email },
    });

    if (!user) {
      return res.json(ResponseError(400, null, "Email không chính xác."));
    }

    const checkPassword = bcrypt.compareSync(matKhau, user.mat_khau);
    if (!checkPassword) {
      return res.json(ResponseError(400, null, "Mật khẩu không chính xác."));
    }
    const { accessToken } = generateToken(user);

    return res.json(
      ResponseSuccess(200, {
        accessToken,
        user: {
          email: user.email,
          hoTen: user.ho_ten,
          tuoi: user.tuoi,
        },
      })
    );
  } catch (error) {
    return res.json(ResponseError(500, null, "Lỗi server!"));
  }
};

const getInforUser = async (req, res) => {
  try {
    const { userId } = req.query;

    const user = await model.nguoi_dung.findFirst({
      where: { nguoi_dung_id: Number(userId) },
    });

    if (!user)
      return res.json(ResponseError(400, {}, "Người dùng không tồn tại."));

    let data = {
      nguoiDungId: user.nguoi_dung_id,
      email: user.email,
      hoTen: user.ho_ten,
      tuoi: user.tuoi,
      anhDaiDien: user.anh_dai_dien,
    };

    return res.json(ResponseSuccess(200, data, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const editInforUser = async (req, res) => {
  try {
    const { email, hoTen, tuoi, anhDaiDien } = req.body;

    const user = await model.nguoi_dung.findFirst({
      where: { nguoi_dung_id: req.user.nguoi_dung_id },
    });

    if (!user)
      return res.json(ResponseError(400, null, "Người dùng không tồn tại."));

    let data = {
      email,
      mat_khau: user.mat_khau,
      ho_ten: hoTen,
      tuoi,
      anh_dai_dien: anhDaiDien ? anhDaiDien : user.anh_dai_dien,
    };

    await model.nguoi_dung.update({
      where: { nguoi_dung_id: req.user.nguoi_dung_id },
      data,
    });

    return res.json(
      ResponseSuccess(
        200,
        { email, hoTen, tuoi, anhDaiDien: data.anh_dai_dien },
        "Cập nhật người dùng thành công."
      )
    );
  } catch (error) {
    return res.json(ResponseError(500, null, "Lỗi server!"));
  }
};

module.exports = {
  register,
  login,
  getInforUser,
  editInforUser,
};
