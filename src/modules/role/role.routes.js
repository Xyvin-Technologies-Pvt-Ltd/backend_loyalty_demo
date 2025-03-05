const express = require("express");
const router = express.Router();
const role_controller = require("./role.controller");
const { protect } = require("../../middlewares/auth/protect");
const { createAuditMiddleware } = require("../audit");

// Create audit middleware for the role module
const roleAudit = createAuditMiddleware("role");

router.use(protect);

// Create and list roles
router.post(
  "/",
  roleAudit.captureResponse(),
  roleAudit.adminAction("create_role", {
    description: "Admin created a new role",
    targetModel: "Role",
    details: req => req.body,
    getModifiedData: (req, res) => {
      if (res.locals.responseBody && res.locals.responseBody.data) {
        return res.locals.responseBody.data;
      }
      return null;
    }
  }),
  role_controller.create
);

router.get(
  "/",
  roleAudit.adminAction("list_roles", {
    description: "Admin viewed all roles",
    targetModel: "Role"
  }),
  role_controller.list
);

// Get, update, and delete a specific role
router.get(
  "/:id",
  roleAudit.adminAction("view_role", {
    description: "Admin viewed a role",
    targetModel: "Role",
    targetId: req => req.params.id
  }),
  role_controller.get_role
);

router.put(
  "/:id",
  roleAudit.captureResponse(),
  roleAudit.adminAction("update_role", {
    description: "Admin updated a role",
    targetModel: "Role",
    targetId: req => req.params.id,
    details: req => req.body,
    getModifiedData: (req, res) => {
      if (res.locals.responseBody && res.locals.responseBody.data) {
        return res.locals.responseBody.data;
      }
      return null;
    }
  }),
  role_controller.update_role
);

router.delete(
  "/:id",
  roleAudit.adminAction("delete_role", {
    description: "Admin deleted a role",
    targetModel: "Role",
    targetId: req => req.params.id
  }),
  role_controller.delete_role
);

module.exports = router;
