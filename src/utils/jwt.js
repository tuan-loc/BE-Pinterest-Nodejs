const jwt = require("jsonwebtoken");
const config = require("../config");

const generateToken = (user) => {
  const payload = {
    email: user.email,
  };

  const token = jwt.sign(payload, config.secretKey, {
    expiresIn: "1y",
  });

  return {
    accessToken: token,
  };
};

const verifyToken = (req) => {
  const token = req.header("Authorization").split(" ")[1];
  return new Promise((resolve, reject) => {
    return jwt.verify(token, config.secretKey, (err, decoded) => {
      if (err) {
        reject(err);
      }
      resolve(decoded);
    });
  });
};

module.exports = {
  generateToken,
  verifyToken,
};
