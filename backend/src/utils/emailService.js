const nodemailer = require('nodemailer');

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not your account password)
  },
});

/**
 * Send a "Set your password" email with a secure JWT link.
 * @param {string} toEmail - Recipient email address
 * @param {string} token   - JWT set-password token
 */
const sendSetPasswordEmail = async (toEmail, token) => {
  const link = `${process.env.CLIENT_URL}/set-password?token=${token}`;

  await transporter.sendMail({
    from: `"TradeFox" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Set your TradeFox password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Welcome to TradeFox</h2>
        <p>Click the button below to set your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${link}"
           style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;
                  border-radius:6px;text-decoration:none;font-weight:600">
          Set your password
        </a>
        <p style="margin-top:16px;color:#6b7280;font-size:13px">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
};

/**
 * Send a welcome email after successful account creation.
 * @param {string} toEmail - Recipient email address
 * @param {string} name    - User's display name
 */
const sendWelcomeEmail = async (toEmail, name) => {
  await transporter.sendMail({
    from: `"TradeFox" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Welcome to TradeFox — Your account is ready!',
    text: `Hey ${name}, welcome to TradeFox! Your account has been successfully created. Visit: ${process.env.CLIENT_URL}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:40px 0">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden">

        <!-- Dark Header -->
        <tr>
          <td style="background:#1a1a2e;padding:28px 40px;text-align:center">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:1px">🦊 TRADEFOX</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px">
            <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;font-weight:700">Account Created Successfully</h2>
            <p style="margin:0 0 8px;color:#333333;font-size:15px;line-height:1.7">
              Congratulations <strong>${name}</strong>, your TradeFox account has been successfully created.
              You can now log in and start trading stocks, track your portfolio, and manage your watchlist.
            </p>
            <p style="margin:0 0 28px;color:#333333;font-size:15px;line-height:1.7">
              For an overview of your account, please visit the Dashboard.
            </p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px">
              <tr>
                <td style="background:#4f46e5;border-radius:4px">
                  <a href="${process.env.CLIENT_URL}"
                     style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none">
                    Visit Your Dashboard
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 6px;color:#555555;font-size:13px;line-height:1.6">
              Don't recognize this activity? Please <a href="${process.env.CLIENT_URL}" style="color:#4f46e5">reset your password</a> immediately.
            </p>
            <p style="margin:0;color:#888888;font-size:13px;font-style:italic">
              This is an automated message, please do not reply.
            </p>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px"><hr style="border:none;border-top:2px solid #4f46e5;margin:0"></td></tr>

        <!-- Social + Footer -->
        <tr>
          <td style="padding:24px 40px;text-align:center">
            <p style="margin:0 0 12px;color:#4f46e5;font-size:13px;font-weight:600">Stay connected!</p>
            <p style="margin:0 0 20px;font-size:20px">𝕏 &nbsp; 📘 &nbsp; 💼 &nbsp; 📺 &nbsp; 📸</p>
            <p style="margin:0 0 8px;color:#888888;font-size:11px;line-height:1.6">
              <strong style="color:#555">Risk warning:</strong> Trading involves high market risk. TradeFox will not be responsible for your trading losses. Please trade with caution.
            </p>
            <p style="margin:0;color:#aaaaaa;font-size:11px">&copy; 2026 TradeFox. All Rights Reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
};

module.exports = { sendSetPasswordEmail, sendWelcomeEmail, sendPasswordResetEmail };

/**
 * Send a "Reset your password" email with a secure JWT link.
 * @param {string} toEmail - Recipient email address
 * @param {string} token   - JWT reset-password token
 */
async function sendPasswordResetEmail(toEmail, token) {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"TradeFox" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset your TradeFox password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your TradeFox password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${link}"
           style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;
                  border-radius:6px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="margin-top:16px;color:#6b7280;font-size:13px">
          If you didn't request a password reset, you can safely ignore this email. Your password will not change.
        </p>
      </div>
    `,
  });
}
