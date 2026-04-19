import nodemailer from "nodemailer"
import { generateInvoicePdf } from "./generateInvoicePdf.js"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// ✅ ADMIN EMAIL (ENV se lo better)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info.indiaheritagetravel@gmail.com"

export const sendInvoiceEmail = async (email, data) => {

  const {
    guestName,
    tourId,
    totalAmount,
    paidAmount,
    remainingAmount
  } = data

  try {

    // ===============================
    // 🔥 GENERATE PDF
    // ===============================
    const pdfBuffer = await generateInvoicePdf(data)

    // ===============================
    // 📩 1. SEND TO CLIENT
    // ===============================
    await transporter.sendMail({
      from: `"India Heritage Travel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invoice for Tour #${tourId} | India Heritage Travel`,

      attachments: [
        {
          filename: `invoice-${tourId}.pdf`,
          content: pdfBuffer
        }
      ],

      html: `
      <div style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 10px;">
          <tr>
            <td align="center">
              <table width="100%" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.08);">

                <tr>
                  <td style="background:#C2A985;padding:25px;text-align:center;">
                    <h2 style="color:#fff;margin:0;">India Heritage Travel</h2>
                    <p style="color:#f3e6c8;font-size:13px;margin-top:5px;">
                      Payment Acknowledgement
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:25px;">
                    <h3>Hello ${guestName},</h3>

                    <p style="font-size:14px;color:#444;">
                      Thank you for your payment.<br/><br/>
                      Your invoice is attached with this email.
                    </p>

                    <p style="font-size:13px;color:#666;">
                      Tour ID: ${tourId}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#999;">
                    © ${new Date().getFullYear()} India Heritage Travel
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
    // 📩 2. SEND TO ADMIN (NEW)
    // ===============================
    await transporter.sendMail({
      from: `"India Heritage Travel" <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,

      subject: `📢 Invoice Sent to ${guestName} (Tour #${tourId})`,

      html: `
      <div style="font-family:Arial;padding:20px;background:#f9fafb;">

        <h2 style="color:#333;">Invoice Sent Notification</h2>

        <p><strong>Client Name:</strong> ${guestName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Tour ID:</strong> ${tourId}</p>

        <hr/>

        <p style="color:green;font-weight:bold;">
          ✅ Invoice has been successfully sent to the client.
        </p>

      </div>
      `
    })

    console.log("✅ Invoice sent to client & admin notified")

  } catch (error) {
    console.error(error)
    throw new Error("Invoice email failed")
  }
}