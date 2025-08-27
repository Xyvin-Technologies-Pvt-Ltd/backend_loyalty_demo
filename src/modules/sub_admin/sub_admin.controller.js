const SubAdmin = require("../../models/admin_model");
const Role = require("../../models/role_model");
const response_handler = require("../../helpers/response_handler");
const jwt = require("jsonwebtoken");

// Create new sub-admin
const createSubAdmin = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, roleId } = req.body;

    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return response_handler(res, 404, "Role not found");
    }

    // Check if email already exists
    const existingAdmin = await SubAdmin.findOne({ email });
    if (existingAdmin) {
      return response_handler(res, 400, "Email already registered");
    }

    const subAdmin = new SubAdmin({
      name,
      email,
      phoneNumber,
      password,
      role: roleId,
    });

    await subAdmin.save();
    await subAdmin.logActivity("CREATE", "Sub-admin account created");

    return response_handler(res, 201, "Sub-admin created successfully", {
      id: subAdmin._id,
      email: subAdmin.email,
    });
  } catch (error) {
    console.error("Error creating sub-admin:", error);
    return response_handler(res, 500, "Error creating sub-admin");
  }
};

// Get all sub-admins
const getAllSubAdmins = async (req, res) => {
  try {
    const search = req.query.search || "";

    const subAdmins = await SubAdmin.find({
      isSuperAdmin: false,
      name: { $regex: search, $options: "i" }, 
    })
      .select("-password -passwordResetToken -passwordResetExpires")
      .populate("role", "name description permissions");

    return response_handler(
      res,
      200,
      "Sub-admins retrieved successfully",
      subAdmins
    );
  } catch (error) {
    console.error("Error fetching sub-admins:", error);
    return response_handler(res, 500, "Error fetching sub-admins");
  }
};


// Get sub-admin by ID
const getSubAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const subAdmin = await SubAdmin.findById(id)
      .select("-password -passwordResetToken -passwordResetExpires")
      .populate("role", "name description permissions");

    if (!subAdmin) {
      return response_handler(res, 404, "Sub-admin not found");
    }

    return response_handler(
      res,
      200,
      "Sub-admin retrieved successfully",
      subAdmin
    );
  } catch (error) {
    console.error("Error fetching sub-admin:", error);
    return response_handler(res, 500, "Error fetching sub-admin");
  }
};

// Update sub-admin
const updateSubAdmin = async (req, res) => {
  try {
    const { name, email, phoneNumber, roleId, isActive } = req.body;
    const subAdmin = await SubAdmin.findById(req.params.id);

    if (!subAdmin) {
      return response_handler(res, 404, "Sub-admin not found");
    }

    // Update fields
    if (name) subAdmin.name = name;
    if (email) subAdmin.email = email;
    if (phoneNumber) subAdmin.phoneNumber = phoneNumber;
    if (roleId) subAdmin.role = roleId;
    if (typeof isActive === "boolean") subAdmin.isActive = isActive;

    await subAdmin.save();
    await subAdmin.logActivity("UPDATE", "Sub-admin details updated");

    return response_handler(res, 200, "Sub-admin updated successfully");
  } catch (error) {
    console.error("Error updating sub-admin:", error);
    return response_handler(res, 500, "Error updating sub-admin");
  }
};

// Delete sub-admin
const deleteSubAdmin = async (req, res) => {
  try {
    const subAdmin = await SubAdmin.findById(req.params.id);

    if (!subAdmin) {
      return response_handler(res, 404, "Sub-admin not found");
    }

    await subAdmin.logActivity("DELETE", "Sub-admin account deleted");
    await SubAdmin.findByIdAndDelete(req.params.id);

    return response_handler(res, 200, "Sub-admin deleted successfully");
  } catch (error) {
    console.error("Error deleting sub-admin:", error);
    return response_handler(res, 500, "Error deleting sub-admin");
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const subAdmin = await SubAdmin.findOne({ email });

    if (!subAdmin) {
      return response_handler(res, 404, "Sub-admin not found");
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: subAdmin._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    subAdmin.passwordResetToken = resetToken;
    subAdmin.passwordResetExpires = Date.now() + 3600000; // 1 hour

    await subAdmin.save();
    await subAdmin.logActivity("PASSWORD_RESET", "Password reset requested");

    // TODO: Send reset email

    return response_handler(
      res,
      200,
      "Password reset instructions sent to email"
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return response_handler(res, 500, "Error resetting password");
  }
};

module.exports = {
  createSubAdmin,
  getAllSubAdmins,
  getSubAdminById,
  updateSubAdmin,
  deleteSubAdmin,
  resetPassword,
};
