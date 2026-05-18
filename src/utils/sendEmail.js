const nodemailer = require("nodemailer");

/**
 * Sends a secure email using nodemailer.
 * Falls back gracefully to console logs if SMTP fails.
 * 
 * @param {Object} options - { to, subject, text, html }
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const user = process.env.email ? process.env.email.trim() : "";
        const pass = process.env.password ? process.env.password.trim() : "";

        if (!user || !pass) {
            console.warn("⚠️ SMTP credentials not found in environment variables. Falling back to console log.");
            return { success: false, error: "SMTP credentials missing" };
        }

        let transporterConfig;
        
        if (user.includes("gmail.com") || user.includes("mgibasket.com")) {
            transporterConfig = {
                service: "gmail",
                auth: { user, pass }
            };
        } else {
            // Default configuration: Try custom domain SMTP (e.g. Hostinger, cPanel, or Google Workspace)
            // If specific SMTP parameters are missing, fallback to Google Workspace / standard secure SMTP
            transporterConfig = {
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port: parseInt(process.env.SMTP_PORT || "465"),
                secure: true, 
                auth: { user, pass },
                tls: {
                    rejectUnauthorized: false // Prevents rejection of self-signed SSL certs
                }
            };
        }

        const transporter = nodemailer.createTransport(transporterConfig);

        await transporter.sendMail({
            from: `"MGI Basket Security Center" <${user}>`,
            to,
            subject,
            text,
            html: html || text
        });

        console.log(`✉️ Email successfully dispatched to ${to}`);
        return { success: true, error: null };
    } catch (error) {
        console.error("❌ Failed to send email via SMTP:", error.message);
        return { success: false, error: error.message };
    }
};

module.exports = sendEmail;
// Nodemon refresh comment - env updated cleanly!
