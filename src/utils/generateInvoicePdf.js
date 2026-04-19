import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// 🔥 THIS IS IMPORTANT
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const generateInvoicePdf = async (data) => {

  const {
    guestName,
    payments = [],
    startDate,
    endDate,
    additionalCosts = [],
    totalAmount = 0
  } = data

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const page = pdfDoc.addPage([600, 800])
  let y = 750

  const primary = rgb(163/255, 134/255, 100/255)

  const formatDate = (date) => {
    if (!date) return "-"
    const d = new Date(date)
    if (isNaN(d.getTime())) return "-"
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    })
  }

  const center = (text, size = 14) => {
    const w = boldFont.widthOfTextAtSize(text, size)
    page.drawText(text, {
      x: (600 - w) / 2,
      y,
      size,
      font: boldFont,
      color: primary
    })
  }

  // ================= LOGO =================
  try {
    const logoPath = path.join(__dirname, "../../public/logo1.png")
    const logoBytes = fs.readFileSync(logoPath)
    const logoImage = await pdfDoc.embedPng(logoBytes)

    const logoWidth = 140
    const logoHeight = 50

    // 👇 LOGO THODA NICHE LAO
    const logoY = y - 20

    page.drawImage(logoImage, {
      x: (600 - logoWidth) / 2,
      y: logoY,
      width: logoWidth,
      height: logoHeight,
    })

    // 👇 GAP CONTROL (MAIN FIX)
    y = logoY - 40   // 👈 yaha 70 ki jagah 40 (perfect spacing)

  } catch (err) {
    console.error("❌ Logo load error:", err.message)
  }

  // ================= HEADER =================
  center("ACKNOWLEDGEMENT OF PAYMENT")
  y -= 30

  page.drawText(`NAME: ${guestName}`, { x: 50, y, size: 11, font: boldFont })
  y -= 20

  page.drawText(
    `TRAVEL DATE: ${startDate || "-"} TO ${endDate || "-"}`,
    { x: 50, y, size: 10, font }
  )

  y -= 40

  // ================= COST =================
  const initialCost = Number(totalAmount) || 0

  let additionalTotal = 0
  additionalCosts.forEach(c => {
    const amt = Number(c.amount) || 0
    if (c.type === "Extra Charge") additionalTotal += amt
    else additionalTotal -= amt
  })

  // ✅ FINAL COST (NO ACTIVITY)
  const totalTripCost = initialCost + additionalTotal

  // ================= PAYMENT =================
  let totalPaid = 0
  let totalFee = 0

  payments.forEach(p => {
    const amount = Number(p?.amount) || 0
    const fee = Number(p?.transactionFee) || 0

    totalPaid += amount

    if (p?.paymentMode === "Card") {
      totalFee += fee
    }
  })

  const netReceived = totalPaid - totalFee

  // ================= BALANCE =================
  const remaining = Math.max(totalTripCost - netReceived, 0)

  // ✅ ONLY FOR DISPLAY (NOT ADDING)
  const razorpayFee = Math.round(remaining * 0.035)

  // ================= DRAW FUNCTION =================
  const drawRow = (label, value, bold = false) => {

    const safeValue = Number(value) || 0
    const valueText = `Rs. ${safeValue.toLocaleString()}`

    page.drawText(label, {
      x: 50,
      y,
      size: 11,
      font: bold ? boldFont : font
    })

    const textWidth = (bold ? boldFont : font).widthOfTextAtSize(valueText, 11)

    const dotsStart = 260
    const dotsWidth = 550 - textWidth - dotsStart
    const dotCount = Math.floor(dotsWidth / 3)

    page.drawText(".".repeat(dotCount > 0 ? dotCount : 5), {
      x: dotsStart,
      y,
      size: 8,
      font
    })

    page.drawText(valueText, {
      x: 550 - textWidth,
      y,
      size: 11,
      font: bold ? boldFont : font
    })

    y -= 20
  }

  // ================= INVOICE =================

  drawRow("TOTAL COST OF THE TRIP", totalTripCost, true)

  y -= 10

   if (additionalTotal !== 0) {
    drawRow("ADDITIONAL COST INCLUDED", additionalTotal)
  }

  const lastPayment = payments[0]

  drawRow(
    `DEPOSIT RECEIVED ON ${
      lastPayment?.paymentDate
        ? formatDate(lastPayment.paymentDate)
        : "-"
    }`,
    totalPaid
  )

  if (totalFee > 0) {
    page.drawText(`(Transaction Fee: Rs. ${totalFee.toLocaleString()})`, {
      x: 50,
      y,
      size: 9,
      font
    })
    y -= 15
  }
  y -= 15

  // ✅ CORRECT BALANCE
  drawRow(
    "BALANCE TO BE PAID",
    remaining,
    true
  )

  y -= 30

  // ================= RAZORPAY INFO =================

  if (remaining > 0) {
    page.drawText(
      `If you pay the remaining amount via Razorpay, an extra 3.50% charge will apply.`,
      { x: 50, y, size: 9, font }
    )

    y -= 15

    page.drawText(
      `Extra 3.50% on Rs. ${remaining.toLocaleString()} = Rs. ${razorpayFee.toLocaleString()}`,
      { x: 50, y, size: 9, font: boldFont }
    )

    y -= 25
  }

  // ================= FOOTER =================

  center("THANK YOU FOR TRAVELLING WITH US", 10)

  y -= 50

  page.drawText("Piyush Singh", { x: 50, y, size: 10, font: boldFont })
  y -= 15

  page.drawText("Founder - India Heritage Travel", { x: 50, y, size: 10, font })
  y -= 15

  page.drawText("info.indiaheritagetravel@gmail.com", { x: 50, y, size: 9, font })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}