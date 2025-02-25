const jwt = require("jsonwebtoken");

exports.generate_token = (userId) => {
  const payload = {
    userId,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
    algorithm: "HS256",
  });

  return token;
};
