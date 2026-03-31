import nodemailer from "nodemailer";

export const sendTeamResetEmail = async (email, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
  <div style="margin:0; padding:0; background:#f5f7fa;">
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">

          <!-- Card Wrapper -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px; margin:40px auto;">

            <!-- Card -->
            <tr>
              <td style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.15);">

                <!-- Header -->
                <div style="background:#CBB299; padding:20px; text-align:center; color:white;">
                  <h2 style="margin:0; font-size:20px;">India Heritage Travel</h2>
                </div>

                <!-- Body -->
                <div style="padding:30px; text-align:center; font-family:Arial, sans-serif; color:#333;">

                  <h3 style="margin-bottom:10px;">Reset Your Password</h3>

                  <p style="font-size:14px; color:#555;">
                    We received a request to reset your password.
                  </p>

                  <!-- Button -->
                  <a 
                    href="${resetLink}" 
                    style="
                      display:inline-block;
                      padding:12px 26px;
                      margin:20px 0;
                      background:#CBB299;
                      color:#ffffff;
                      text-decoration:none;
                      border-radius:8px;
                      font-size:15px;
                    "
                  >
                    Reset Password
                  </a>

                  <p style="font-size:13px; color:#777;">
                    This link will expire in <b>15 minutes</b>.
                  </p>

                  <!-- Fallback -->
                  <p style="font-size:12px; color:#999; margin-top:20px;">
                    If the button doesn’t work, copy and paste this link:
                  </p>

                  <p style="word-break:break-all; font-size:12px; color:#555;">
                    ${resetLink}
                  </p>

                </div>

                <!-- Footer -->
                <div style="padding:20px; text-align:center; font-size:12px; color:#aaa; background:#f5f5f5;">
                  If you didn’t request this, you can safely ignore this email.
                  <br /><br />
                  © ${new Date().getFullYear()} India Heritage Travel
                </div>

              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>
  `;

  await transporter.sendMail({
    from: `"India Heritage Travel" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html,
  });
};