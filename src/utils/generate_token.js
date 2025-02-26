const jwt = require("jsonwebtoken");

exports.generate_token = (user_id) => {
  const payload = {
    user_id,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
    algorithm: "HS256",
  });

  return token;
};
