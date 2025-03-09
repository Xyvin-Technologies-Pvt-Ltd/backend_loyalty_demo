const express = require("express");
const router = express.Router();
const {
  createEmailTemplate,
  getAllEmailTemplates,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
} = require("./email_template.controllers");
const {
  createEmailCampaign,
  getAllEmailCampaigns,
  getEmailCampaignById,
  updateEmailCampaign,
  deleteEmailCampaign,
  sendTestEmail,
  sendEmailCampaign,
} = require("./email_campaign.controllers");
const { authorizePermission } = require("../../../middlewares/auth/auth");
const { createAuditMiddleware } = require("../../audit");

// Create audit middleware for email communications
const emailAudit = createAuditMiddleware("email_communication");

// Email Template Routes
router.get(
  "/templates",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  emailAudit.captureResponse(),
  emailAudit.adminAction("view_email_templates", {
    description: "Admin viewed all email templates",
    targetModel: "EmailTemplate",
  }),
  getAllEmailTemplates
);

router.get(
  "/templates/:id",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  emailAudit.captureResponse(),
  emailAudit.adminAction("view_email_template", {
    description: "Admin viewed an email template",
    targetModel: "EmailTemplate",
  }),
  getEmailTemplateById
);

router.post(
  "/templates",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  emailAudit.captureResponse(),
  emailAudit.adminAction("create_email_template", {
    description: "Admin created a new email template",
    targetModel: "EmailTemplate",
  }),
  createEmailTemplate
);

router.put(
  "/templates/:id",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  emailAudit.captureResponse(),
  emailAudit.adminAction("update_email_template", {
    description: "Admin updated an email template",
    targetModel: "EmailTemplate",
  }),
  updateEmailTemplate
);

router.delete(
  "/templates/:id",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  emailAudit.captureResponse(),
  emailAudit.adminAction("delete_email_template", {
    description: "Admin deleted an email template",
    targetModel: "EmailTemplate",
  }),
  deleteEmailTemplate
);

// Email Campaign Routes
router.get(
  "/campaigns",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  emailAudit.captureResponse(),
  emailAudit.adminAction("view_email_campaigns", {
    description: "Admin viewed all email campaigns",
    targetModel: "EmailCampaign",
  }),
  getAllEmailCampaigns
);

router.get(
  "/campaigns/:id",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  emailAudit.captureResponse(),
  emailAudit.adminAction("view_email_campaign", {
    description: "Admin viewed an email campaign",
    targetModel: "EmailCampaign",
  }),
  getEmailCampaignById
);

router.post(
  "/campaigns",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  emailAudit.captureResponse(),
  emailAudit.adminAction("create_email_campaign", {
    description: "Admin created a new email campaign",
    targetModel: "EmailCampaign",
  }),
  createEmailCampaign
);

router.put(
  "/campaigns/:id",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  emailAudit.captureResponse(),
  emailAudit.adminAction("update_email_campaign", {
    description: "Admin updated an email campaign",
    targetModel: "EmailCampaign",
  }),
  updateEmailCampaign
);

router.delete(
  "/campaigns/:id",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  emailAudit.captureResponse(),
  emailAudit.adminAction("delete_email_campaign", {
    description: "Admin deleted an email campaign",
    targetModel: "EmailCampaign",
  }),
  deleteEmailCampaign
);

router.post(
  "/campaigns/:id/test",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  emailAudit.captureResponse(),
  emailAudit.adminAction("send_test_email", {
    description: "Admin sent a test email",
    targetModel: "EmailCampaign",
  }),
  sendTestEmail
);

router.post(
  "/campaigns/:id/send",
  authorizePermission("MANAGE_COMMUNICATIONS"),
  emailAudit.captureResponse(),
  emailAudit.adminAction("send_email_campaign", {
    description: "Admin sent or scheduled an email campaign",
    targetModel: "EmailCampaign",
  }),
  sendEmailCampaign
);

module.exports = router;
