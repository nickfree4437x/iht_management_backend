import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

export const generateInvoicePdf = async (data) => {

  const {
    guestName,
    payments = [],
    startDate,
    endDate,
    activities = [],
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

  // ================= HEADER =================
  center("ACKNOWLEDGEMENT OF PAYMENT")
  y -= 40

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

  const activityTotal = activities.reduce((s, a) => {
    return s + (Number(a.price) || 0)
  }, 0)

  const totalTripCost = initialCost + additionalTotal + activityTotal

  // ================= 🔥 PAYMENT (FIXED) =================
  let totalPaid = 0
  let totalFee = 0

  payments.forEach(p => {
    const amount = Number(p?.amount) || 0
    const fee = Number(p?.transactionFee) || 0

    totalPaid += amount

    // 🔥 ONLY CARD FEE COUNT
    if (p?.paymentMode === "Card") {
      totalFee += fee
    }
  })

  // 🔥 REAL MONEY RECEIVED
  const netReceived = totalPaid - totalFee

  // ================= 🔥 BALANCE (FIXED) =================
  const remaining = totalTripCost - netReceived

  const balanceFee = Math.round(
    (remaining > 0 ? remaining : 0) * 0.035
  )

  const finalBalance = Math.max(0, remaining + balanceFee)

  // ================= DRAW =================
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

  drawRow("INITIAL COSTING", initialCost)

  if (additionalTotal !== 0) {
    drawRow("ADDITIONAL COST", additionalTotal)
  }

  activities.forEach(a => {
    drawRow(a.name, a.price)
  })

  drawRow("TOTAL COST OF THE TRIP", totalTripCost, true)

  y -= 10

  const lastPayment = payments[0]

  drawRow(
    `DEPOSIT RECEIVED ON ${
      lastPayment?.paymentDate
        ? formatDate(lastPayment.paymentDate)
        : "-"
    }`,
    totalPaid
  )

  // 🔥 SHOW FEE IF EXISTS
  if (totalFee > 0) {
    page.drawText(`(Transaction Fee: Rs. ${totalFee.toLocaleString()})`, {
      x: 50,
      y,
      size: 9,
      font
    })
    y -= 15
  }

  // 🔥 OPTIONAL (RECOMMENDED)
  page.drawText(`(Net Received: Rs. ${Math.round(netReceived).toLocaleString()})`, {
    x: 50,
    y,
    size: 9,
    font
  })
  y -= 15

  drawRow(
    "BALANCE TO BE PAID (INCLUDING BANK FEE)",
    finalBalance,
    true
  )

  y -= 30

  // ================= FOOTER =================

  page.drawText(
    "Credit card payments have a charge of 3.50% extra.",
    { x: 300, y, size: 9, font }
  )

  y -= 15

  y -= 40

  center("THANK YOU FOR TRAVELLING WITH US", 10)

  y -= 50

  page.drawText("Piyush Singh", { x: 50, y, size: 10, font: boldFont })
  y -= 15

  page.drawText("Director", { x: 50, y, size: 10, font })
  y -= 15

  page.drawText("India Heritage Travel Pvt. Ltd.", { x: 50, y, size: 10, font })
  y -= 15

  page.drawText("info@indiaheritage.com", { x: 50, y, size: 9, font })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}