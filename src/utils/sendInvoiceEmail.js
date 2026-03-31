import nodemailer from "nodemailer"
import { generateInvoicePdf } from "./generateInvoicePdf.js"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export const sendInvoiceEmail = async (email, data) => {

  const {
    guestName,
    tourId
  } = data

  try {

    // ===============================
    // 🔥 GENERATE PDF
    // ===============================
    const pdfBuffer = await generateInvoicePdf(data)

    // ===============================
    // 📩 SEND EMAIL
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

                <!-- HEADER -->
                <tr>
                  <td style="background:#CBB299;padding:25px;text-align:center;">
                    <h2 style="color:#fff;margin:0;">India Heritage Travel</h2>
                    <p style="color:#f3e6c8;font-size:13px;margin-top:5px;">
                      Payment Acknowledgement
                    </p>
                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding:25px;">

                    <h3 style="margin:0 0 10px;">Hello ${guestName},</h3>

                    <p style="font-size:14px;color:#444;">
                      Thank you for your payment 🙏<br/><br/>
                      Please find your <strong>Invoice & Payment Details</strong> attached with this email.
                    </p>

                    <div style="margin-top:20px;padding:15px;background:#f9fafb;border-radius:10px;border:1px solid #eee;">
                      <p style="margin:0;font-size:13px;color:#666;">
                        📎 Invoice PDF attached<br/>
                        📌 Contains full payment summary & history
                      </p>
                    </div>

                    <p style="margin-top:20px;font-size:13px;color:#777;">
                      If you have any questions, feel free to reply to this email.
                    </p>

                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#999;">
                    © ${new Date().getFullYear()} India Heritage Travel<br/>
                    info.indiaheritagetravel@gmail.com
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

      </div>
      `
    })

    console.log("✅ Invoice email sent (clean version)")

  } catch (error) {
    console.error(error)
    throw new Error("Invoice email failed")
  }
}