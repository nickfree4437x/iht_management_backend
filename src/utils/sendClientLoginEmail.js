import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// ===============================
// 📩 LOGIN EMAIL + ADMIN ALERT
// ===============================
export const sendClientLoginEmail = async (email, password, tourId) => {
  try {

    const loginUrl = `${process.env.CLIENT_URL}/client/login`
    const logoUrl = `${process.env.CLIENT_URL}/logo/logo.png` // 🔥 LOGO PATH

    // ===============================
    // 🟢 CLIENT EMAIL
    // ===============================
    await transporter.sendMail({
      from: `"India Heritage Travel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Login Credentials",

      html: `
      <div style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 10px;">
          <tr>
            <td align="center">

              <table width="100%" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.08);">

                <!-- HEADER -->
                <tr>
                  <td style="background:#C2A985;padding:25px;text-align:center;">
        
                    <h2 style="color:#fff;margin:0;font-weight:600;">
                      India Heritage Travel
                    </h2>
                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding:30px 24px;">

                    <h3 style="margin:0 0 10px;color:#1f2937;">
                      Welcome 👋
                    </h3>

                    <p style="color:#4b5563;font-size:14px;line-height:1.6;">
                      Your client account has been successfully created.
                      Use the credentials below to login.
                    </p>

                    <!-- CREDENTIAL BOX -->
                    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:18px;margin:24px 0;">
                      
                      <p><strong>Email:</strong><br/>${email}</p>

                      <p style="margin-top:12px;">
                        <strong>Password:</strong><br/>
                        <span style="background:#eef2ff;padding:6px 10px;border-radius:6px;font-family:monospace;">
                          ${password}
                        </span>
                      </p>

                    </div>

                    <!-- CTA -->
                    <div style="text-align:center;margin:25px 0;">
                      <a href="${loginUrl}"
                        style="display:inline-block;padding:12px 28px;background:#C2A985;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
                        Login Now
                      </a>
                    </div>

                    <!-- NOTE -->
                    <div style="background:#fff7ed;border:1px solid #fdba74;border-radius:8px;padding:10px;font-size:13px;color:#9a3412;">
                      🔐 Please change your password after first login.
                    </div>

                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background:#f9fafb;padding:15px;text-align:center;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;">
                      © ${new Date().getFullYear()} India Heritage Travel
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

    // ===============================
    // 🔥 ADMIN EMAIL
    // ===============================
    await transporter.sendMail({
      from: `"India Heritage Travel" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,

      subject: "New Client Account Created",

      html: `
      <div style="font-family:Arial,sans-serif;background:#f5f7fa;padding:20px;">
        
        <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:14px;padding:22px;box-shadow:0 15px 30px rgba(0,0,0,0.08);">

          <h2 style="color:#111827;">
            New Client Account Created
          </h2>

          <p style="color:#4b5563;font-size:14px;">
            A new client account has been created.
          </p>

          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin:20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Tour ID:</strong> ${tourId || "N/A"}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <p style="font-size:12px;color:#9ca3af;">
            System generated notification.
          </p>

        </div>

      </div>
      `
    })

  } catch (error) {
    console.error("❌ Email error:", error)
    throw new Error("Email sending failed")
  }
}
