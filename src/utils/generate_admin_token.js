const jwt = require("jsonwebtoken");
const Role = require("../models/role_model");
const Admin = require("../models/admin_model");

exports.generate_admin_token = async (user_id) => {
  try {
    // Fetch user details along with role and permissions
    const admin = await Admin.findById(user_id).populate("role");

    if (!admin) {
      throw new Error("Admin not found");
    }

    const roleName = admin.role ? admin.role.name : "user";
    const permissions = admin.role && admin.role.permissions ? admin.role.permissions : [];

    const payload = {
      admin_id: admin._id,
      name: admin.name,
      email: admin.email,
      role: roleName,
      permissions: permissions,
      status: admin.status,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30d",
      algorithm: "HS256",
    });

    return token;
  } catch (error) {
    console.error("Error generating token:", error.message);
    throw new Error("Token generation failed");
  }
};