const express = require("express");
const router = express.Router();
const auth_controller = require("./auth.controller");
const protect = require("../../middlewares/protect");
const key_protect = require("../../middlewares/key_protect");
const { createAuditMiddleware } = require("../audit");

// Create audit middleware for the auth module
const authAudit = createAuditMiddleware("auth");

// Login route with audit logging
router.post(
    "/login",
    key_protect,
    authAudit.authentication("login", {
        description: "User login attempt",
        details: req => ({
            username: req.body.username || req.body.email
        })
    }),
    authAudit.captureResponse(),
    auth_controller.login
);

// Signup route with audit logging
router.post(
    "/signup",
    protect,
    authAudit.dataModification("signup", {
        description: "Admin created a new user account",
        targetModel: "User",
        details: req => ({
            username: req.body.username,
            email: req.body.email
        })
    }),
    authAudit.captureResponse(),
    auth_controller.signup
);

// Register route with audit logging
router.post(
    "/register",
    key_protect,
    authAudit.dataModification("register", {
        description: "New user registration",
        targetModel: "User",
        details: req => ({
            username: req.body.username,
            email: req.body.email
        })
    }),
    authAudit.captureResponse(),
    auth_controller.register
);

module.exports = router;
