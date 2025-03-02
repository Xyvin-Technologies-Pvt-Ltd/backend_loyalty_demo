const Role = require("../models/role_model");
const { logger } = require("../middlewares/logger");

/**
 * Seed audit permissions
 */
const seedAuditPermissions = async () => {
    try {
        logger.info("Seeding audit permissions...");

        // Define audit permissions
        const auditPermissions = [
            "VIEW_AUDIT_LOGS",
            "VIEW_SYSTEM_LOGS",
            "VIEW_API_LOGS",
            "EXPORT_AUDIT_LOGS"
        ];

        // Update admin role with audit permissions
        const adminRole = await Role.findOne({ name: "Admin" });
        if (adminRole) {
            // Add audit permissions if they don't exist
            auditPermissions.forEach(permission => {
                if (!adminRole.permissions.includes(permission)) {
                    adminRole.permissions.push(permission);
                }
            });
            await adminRole.save();
            logger.info("Added audit permissions to Admin role");
        }

        // Update security officer role with audit permissions if it exists
        const securityRole = await Role.findOne({ name: "Security Officer" });
        if (securityRole) {
            // Add audit permissions if they don't exist
            auditPermissions.forEach(permission => {
                if (!securityRole.permissions.includes(permission)) {
                    securityRole.permissions.push(permission);
                }
            });
            await securityRole.save();
            logger.info("Added audit permissions to Security Officer role");
        } else {
            // Create security officer role if it doesn't exist
            const newSecurityRole = new Role({
                name: "Security Officer",
                description: "Role for security officers who can view audit logs and monitor system security",
                permissions: auditPermissions
            });
            await newSecurityRole.save();
            logger.info("Created Security Officer role with audit permissions");
        }

        logger.info("Audit permissions seeded successfully");
    } catch (error) {
        logger.error(`Error seeding audit permissions: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
};

module.exports = seedAuditPermissions; 