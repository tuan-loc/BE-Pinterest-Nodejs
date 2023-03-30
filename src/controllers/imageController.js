const { PrismaClient } = require("@prisma/client");
const { ResponseSuccess, ResponseError } = require("../utils/response");
const config = require("../config");

const model = new PrismaClient();

const getImage = async (req, res) => {
  try {
    const image = await model.hinh_anh.findMany({
      include: { nguoi_dung: true },
    });

    const data = image.reverse().map((img) => {
      return {
        hinhId: img.hinh_id,
        tieuDe: img.tieu_de,
        tenHinh: `${config.url}/${img.ten_hinh}`,
        duongDan: img.duong_dan,
        moTa: img.mo_ta,
        nguoiDung: {
          nguoiDungId: img.nguoi_dung.nguoi_dung_id,
          email: img.nguoi_dung.email,
          hoTen: img.nguoi_dung.ho_ten,
          tuoi: img.nguoi_dung.tuoi,
          anhDaiDien: `${config.url}/${img.nguoi_dung.anh_dai_dien}`,
        },
      };
    });

    return res.json(ResponseSuccess(201, data, "Thành công."));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const addImage = async (req, res) => {
  try {
    const { tieuDe, duongDan, moTa } = req.body;

    const user = await model.nguoi_dung.findFirst({
      where: { nguoi_dung_id: req.user.nguoi_dung_id },
    });

    if (!user) return res.json(ResponseError(400, "", "Vui lòng đăng nhập."));

    if (!tieuDe)
      return res.json(ResponseError(400, "", "Tiêu đề không được bỏ trống."));

    if (!req.file)
      return res.json(ResponseError(400, "", "Vui lòng upload hình."));

    let data = {
      tieu_de: tieuDe,
      ten_hinh: req.file.filename,
      duong_dan: duongDan ? duongDan : "",
      mo_ta: moTa ? moTa : "",
      nguoi_dung_id: req.user.nguoi_dung_id,
    };

    await model.hinh_anh.create({ data });

    return res.json(ResponseSuccess(201, data, "Thêm ảnh thành công."));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const searchImage = async (req, res) => {
  try {
    const { tuKhoa } = req.query;

    const images = await model.hinh_anh.findMany({
      include: { nguoi_dung: true },
      where: { tieu_de: { contains: tuKhoa } },
    });

    if (images.length === 0)
      return res.json(ResponseError(400, null, "Không tìm thấy hình ảnh."));

    const data = images.reverse().map((img) => {
      return {
        hinhId: img.hinh_id,
        tieuDe: img.tieu_de,
        tenHinh: `${config.url}/${img.ten_hinh}`,
        duongDan: img.duong_dan,
        moTa: img.mo_ta,
        nguoiDung: {
          nguoiDungId: img.nguoi_dung.nguoi_dung_id,
          email: img.nguoi_dung.email,
          hoTen: img.nguoi_dung.ho_ten,
          tuoi: img.nguoi_dung.tuoi,
          anhDaiDien: `${config.url}/${img.nguoi_dung.anh_dai_dien}`,
        },
      };
    });

    return res.json(ResponseSuccess(200, data, "Thành công."));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const getInforImage = async (req, res) => {
  try {
    const { hinhId } = req.query;

    const image = await model.hinh_anh.findFirst({
      include: { nguoi_dung: true },
      where: { hinh_id: Number(hinhId) },
    });

    if (!image)
      return res.json(ResponseError(400, "", "Không tìm thấy hình ảnh."));

    const data = {
      hinhId: image.hinh_id,
      tieuDe: image.tieu_de,
      tenHinh: `${config.url}/${image.ten_hinh}`,
      duongDan: image.duong_dan,
      moTa: image.mo_ta,
      nguoiDung: {
        nguoiDungId: image.nguoi_dung_id,
        email: image.nguoi_dung.email,
        hoTen: image.nguoi_dung.ho_ten,
        tuoi: image.nguoi_dung.tuoi,
        anhDaiDien: image.nguoi_dung.anh_dai_dien,
      },
    };

    return res.json(ResponseSuccess(201, data, "Thành công."));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const getComment = async (req, res) => {
  try {
    const { hinhId } = req.query;

    const comments = await model.binh_luan.findMany({
      include: { nguoi_dung: true },
      where: { hinh_id: Number(hinhId) },
    });

    let data = comments.map((cmt) => {
      return {
        binhLuanId: cmt.binh_luan_id,
        hinhId: cmt.hinh_id,
        ngayBinhLuan: cmt.ngay_binh_luan,
        noiDung: cmt.noi_dung,
        nguoiDung: {
          nguoiDungId: cmt.nguoi_dung.nguoi_dung_id,
          email: cmt.nguoi_dung.email,
          hoTen: cmt.nguoi_dung.ho_ten,
          tuoi: cmt.nguoi_dung.tuoi,
          anhDaiDien: cmt.nguoi_dung.anh_dai_dien,
        },
      };
    });

    return res.json(ResponseSuccess(201, data, "Thành công."));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const commentImage = async (req, res) => {
  try {
    const { nguoi_dung_id } = req.user;
    const { hinhId, noiDung } = req.body;

    if (!hinhId)
      return res.json(ResponseError(400, "", "Id ảnh không được bỏ trống."));

    if (!noiDung)
      return res.json(
        ResponseError(400, "", "Nội dung bình luận không được bỏ trống.")
      );

    const user = await model.nguoi_dung.findFirst({ where: { nguoi_dung_id } });
    if (!user)
      return res.json(
        ResponseError(
          400,
          "",
          "Người dùng không tồn tại. Vui lòng đăng nhập lại."
        )
      );

    let data = {
      nguoi_dung_id,
      hinh_id: Number(hinhId),
      ngay_binh_luan: new Date(),
      noi_dung: noiDung,
    };

    let newComment = await model.binh_luan.create({ data });

    return res.json(
      ResponseSuccess(
        201,
        {
          binhLuanId: newComment.binh_luan_id,
          nguoiDungId: newComment.nguoi_dung_id,
          hinhId: newComment.hinh_id,
          ngayBinhLuan: newComment.ngay_binh_luan,
          noiDung: newComment.noi_dung,
        },
        "Thành công."
      )
    );
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const saveImage = async (req, res) => {
  try {
    const { nguoi_dung_id } = req.user;
    const { hinhId } = req.query;

    const user = await model.nguoi_dung.findFirst({ where: { nguoi_dung_id } });
    if (!user)
      return res.json(
        ResponseError(
          400,
          "",
          "Người dùng không tồn tại. Vui lòng đăng nhập lại."
        )
      );

    const img = await model.hinh_anh.findFirst({
      where: { hinh_id: Number(hinhId) },
    });
    if (!img)
      return res.json(ResponseError(400, "", "Hình ảnh không tồn tại."));

    let data = {
      nguoi_dung_id,
      hinh_id: Number(hinhId),
      ngay_luu: new Date(),
    };

    let saveImg = await model.luu_anh.create({ data });

    return res.json(
      ResponseSuccess(
        201,
        {
          nguoiDungId: saveImg.nguoi_dung_id,
          hinhId: saveImg.hinh_id,
          ngayLuu: saveImg.ngay_luu,
        },
        "Thành công."
      )
    );
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const getSavedImage = async (req, res) => {
  try {
    const { nguoi_dung_id } = req.user;
    const { hinhId } = req.query;

    const user = await model.nguoi_dung.findFirst({ where: { nguoi_dung_id } });
    if (!user)
      return res.json(
        ResponseError(
          400,
          "",
          "Người dùng không tồn tại. Vui lòng đăng nhập lại."
        )
      );

    const img = await model.hinh_anh.findFirst({
      where: { hinh_id: Number(hinhId) },
    });
    if (!img)
      return res.json(ResponseError(400, "", "Hình ảnh không tồn tại."));

    const saveImg = await model.luu_anh.findFirst({
      where: { nguoi_dung_id: Number(nguoi_dung_id), hinh_id: Number(hinhId) },
    });

    if (!saveImg)
      return res.json(
        ResponseSuccess(
          201,
          {
            daLuu: false,
          },
          "Thành công."
        )
      );

    return res.json(
      ResponseSuccess(
        201,
        {
          nguoiDungId: saveImg.nguoi_dung_id,
          hinhId: saveImg.hinh_id,
          ngayLuu: saveImg.ngay_luu,
          daLuu: true,
        },
        "Thành công."
      )
    );
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const getImageListCreated = async (req, res) => {
  try {
    const { userId } = req.query;

    const user = await model.nguoi_dung.findFirst({
      where: { nguoi_dung_id: Number(userId) },
    });
    if (!user)
      return res.json(ResponseError(400, "", "Người dùng không tồn tại."));

    const images = await model.hinh_anh.findMany({
      where: { nguoi_dung_id: Number(userId) },
    });

    if (images.length.length === 0)
      return res.json(ResponseSuccess(201, [], "Thành công."));

    let data = images.map((img) => {
      return {
        hinhId: img.hinh_id,
        tieuDe: img.tieu_de,
        tenHinh: `${config.url}/${img.ten_hinh}`,
        duongDan: img.duong_dan,
        moTa: img.mo_ta,
      };
    });

    return res.json(ResponseSuccess(201, data, "Thành công."));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const getImageListSaved = async (req, res) => {
  try {
    const { userId } = req.query;

    const user = await model.nguoi_dung.findFirst({
      where: { nguoi_dung_id: Number(userId) },
    });
    if (!user)
      return res.json(ResponseError(400, "", "Người dùng không tồn tại."));

    const images = await model.luu_anh.findMany({
      where: { nguoi_dung_id: Number(userId) },
      include: { hinh_anh: true },
    });

    if (images.length.length === 0)
      return res.json(ResponseSuccess(201, [], "Thành công."));

    let data = images.map((img) => {
      return {
        nguoiDungId: img.nguoi_dung_id,
        ngayLuu: img.ngay_luu,
        hinhAnh: {
          hinhId: img.hinh_anh.hinh_id,
          tieuDe: img.hinh_anh.tieu_de,
          tenHinh: `${config.url}/${img.hinh_anh.ten_hinh}`,
          duongDan: img.hinh_anh.duong_dan,
          moTa: img.hinh_anh.mo_ta,
        },
      };
    });

    return res.json(ResponseSuccess(201, data, "Thành công."));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const deleteImage = async (req, res) => {
  try {
    const { nguoi_dung_id } = req.user;
    const { hinhId } = req.body;

    const user = await model.nguoi_dung.findFirst({
      where: { nguoi_dung_id },
    });

    if (!user)
      return res.json(
        ResponseError(
          400,
          "",
          "Người dùng không tồn tại. Vui lòng đăng nhập lại."
        )
      );

    const image = await model.hinh_anh.findFirst({
      where: { hinh_id: Number(hinhId), nguoi_dung_id },
    });

    if (!image)
      return res.json(ResponseError(400, "", "Hình ảnh không tồn tại."));

    await model.hinh_anh.delete({
      where: { hinh_id: Number(hinhId) },
    });

    return res.json(ResponseSuccess(201, "", "Xóa thành công."));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const unsaveImage = async (req, res) => {
  try {
    const { nguoi_dung_id } = req.user;
    const { hinhId } = req.body;

    const user = await model.nguoi_dung.findFirst({
      where: { nguoi_dung_id },
    });

    if (!user)
      return res.json(
        ResponseError(
          400,
          "",
          "Người dùng không tồn tại. Vui lòng đăng nhập lại."
        )
      );

    const image = await model.luu_anh.findFirst({
      where: { hinh_id: Number(hinhId), nguoi_dung_id },
    });

    if (!image)
      return res.json(ResponseError(400, "", "Hình ảnh không tồn tại."));

    await model.luu_anh.delete({
      where: { luu_anh_id: image.luu_anh_id },
    });

    return res.json(ResponseSuccess(200, "", "Hủy lưu ảnh."));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

module.exports = {
  getImage,
  addImage,
  searchImage,
  getInforImage,
  getComment,
  commentImage,
  saveImage,
  getSavedImage,
  getImageListCreated,
  getImageListSaved,
  deleteImage,
  unsaveImage,
};
