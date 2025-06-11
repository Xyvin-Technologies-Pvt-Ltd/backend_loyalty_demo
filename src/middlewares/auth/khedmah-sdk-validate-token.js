const jwt = require("jsonwebtoken");
const response_handler = require("../../helpers/response_handler");

function khedmahSdkValidateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return response_handler(res, 401, "No token provided.");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.customer_id = decoded.customer_id;
    next();
  } catch (error) {
    return response_handler(res, 401, "Invalid token.");
  }
}

module.exports = {
  khedmahSdkValidateToken,
};
