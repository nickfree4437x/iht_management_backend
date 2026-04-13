import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// ===============================
// 📩 RESET PASSWORD EMAIL
// ===============================
export const sendClientResetEmail = async (email, resetLink) => {
  try {

    await transporter.sendMail({
      from: `"India Heritage Travel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password 🔐",

      html: `
      <div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
          <tr>
            <td align="center">

              <!-- CARD -->
              <table width="600" cellpadding="0" cellspacing="0" 
                style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.08);">

                <!-- HEADER -->
                <tr>
                  <td style="background:#C2A985;padding:20px;text-align:center;">
                    <h2 style="color:#ffffff;margin:0;">India Heritage Travel</h2>
                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding:30px;">

                    <h3 style="margin-top:0;color:#333;">
                      Reset Your Password 🔐
                    </h3>

                    <p style="color:#555;line-height:1.6;">
                      We received a request to reset your password. 
                      Click the button below to create a new one.
                    </p>

                    <!-- BUTTON -->
                    <div style="text-align:center;margin:30px 0;">
                      <a href="${resetLink}"
                        style="
                          display:inline-block;
                          padding:14px 28px;
                          background:#C2A985;
                          color:#fff;
                          text-decoration:none;
                          border-radius:8px;
                        ">
                        Reset Password
                      </a>
                    </div>

                    <!-- WARNING -->
                    <p style="color:#777;font-size:14px;">
                      ⏳ This link will expire in <strong>1 hour</strong>.
                    </p>

                    <p style="color:#777;font-size:14px;">
                      If you didn’t request this, you can safely ignore this email.
                    </p>

                    <!-- FALLBACK LINK -->
                    <p style="font-size:12px;color:#aaa;margin-top:20px;">
                      If the button doesn’t work, copy and paste this link into your browser:
                    </p>

                    <p style="word-break:break-all;font-size:12px;color:#555;">
                      ${resetLink}
                    </p>

                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background:#f4f6f8;padding:15px;text-align:center;">
                    <p style="margin:0;color:#888;font-size:12px;">
                      © ${new Date().getFullYear()} India Heritage Travel. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

      </div>
      `
    })

  } catch (error) {
    console.error("❌ Reset email error:", error)
    throw new Error("Reset email not sent")
  }
}