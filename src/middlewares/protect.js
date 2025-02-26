const jwt = require("jsonwebtoken");
const response_handler = require("../helpers/response_handler");
const Admin = require("../models/admin_model");
const User = require("../models/user_model");

const protect = async (req, res, next) => {
  try {
    //? Check for API key
    const apiKey = req.headers["api-key"];
    if (!apiKey) {
      return response_handler(res, 401, "No API key provided.");
    }
    if (apiKey !== process.env.API_KEY) {
      return response_handler(res, 401, "Invalid API key.");
    }

    //? Check for authorization header and extract token
    const authHeader = req.headers["authorization"];
    const jwtToken = authHeader && authHeader.split(" ")[1];
    if (!jwtToken) {
      return response_handler(res, 401, "No token provided.");
    }

    //? Verify JWT token
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    req.user_id = decoded.user_id;

    //? Find the user in the database
    const admin = await Admin.findById(req.user_id);
    if (!admin) {
      const user = await User.findById(req.user_id);
      if (!user) {
        return response_handler(res, 401, "User not found.");
      }
      req.user = user;
      return next();
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return response_handler(res, 403, "Invalid token.");
    }
    if (error.name === "TokenExpiredError") {
      return response_handler(res, 403, "Token has expired.");
    }
    return response_handler(res, 500, "Failed to authenticate token.");
  }
};

module.exports = protect;
