import prisma from "../../config/prisma.js"
import { sendInvoiceEmail } from "../../utils/sendInvoiceEmail.js"

export const sendInvoice = async (req, res) => {
  try {
    const { tourId, email } = req.body

    // ===============================
    // 🔒 VALIDATION
    // ===============================
    if (!tourId || !email) {
      return res.status(400).json({
        success: false,
        message: "Tour ID and Email are required"
      })
    }

    // ===============================
    // 📅 SAFE DATE FORMAT
    // ===============================
    const formatDate = (date) => {
      try {
        if (!date) return "-"
        const d = new Date(date)
        if (isNaN(d.getTime())) return "-"
        return d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        })
      } catch {
        return "-"
      }
    }

    // ===============================
    // 🔥 GET TOUR
    // ===============================
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: {
        id: true,
        guestName: true,
        totalCost: true,
        startDate: true,
        endDate: true
      }
    })

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found"
      })
    }

    // ===============================
    // 🔥 FETCH PAYMENTS
    // ===============================
    let payments = []
    try {
      payments = await prisma.payment.findMany({
        where: { tourId },
        orderBy: { paymentDate: "desc" }
      })
    } catch (err) {
      console.error("❌ Payment Fetch Error:", err)
      payments = []
    }

    // ===============================
    // 🔥 FETCH ACTIVITIES
    // ===============================
    let tourActivities = []
    try {
      tourActivities = await prisma.tourActivity.findMany({
        where: { tourId },
        include: { activity: true }
      })
    } catch (err) {
      console.error("❌ Activity Fetch Error:", err)
      tourActivities = []
    }

    const formattedActivities = tourActivities.map(item => ({
      name: item?.activity?.name || "N/A",
      price: Number(item?.activity?.price) || 0
    }))

    // ===============================
    // 🔥 FETCH ADDITIONAL COSTS
    // ===============================
    let additionalCosts = []
    try {
      additionalCosts = await prisma.additionalCost.findMany({
        where: { tourId },
        orderBy: { createdAt: "desc" }
      })
    } catch (err) {
      console.error("❌ Additional Cost Fetch Error:", err)
      additionalCosts = []
    }

    const formattedCosts = additionalCosts.map(cost => ({
      amount: Number(cost?.amount) || 0,
      type: cost?.status === "increase" ? "Extra Charge" : "Discount",
      comment: cost?.comment || ""
    }))

    // ===============================
    // 💰 CALCULATIONS (🔥 FIXED)
    // ===============================

    // ✅ Total Paid (after refund)
    const paidAmount = payments.reduce((sum, p) => {
      const amount = Number(p?.amount) || 0
      const refund = Number(p?.refundAmount) || 0
      return sum + (amount - refund)
    }, 0)

    // ✅ Total Transaction Fee
    const totalTransactionFee = payments.reduce((sum, p) => {
      return sum + (Number(p?.transactionFee) || 0)
    }, 0)

    // ✅ Net Received (after fee + refund)
    const netReceived = payments.reduce((sum, p) => {
      const amount = Number(p?.amount) || 0
      const fee = Number(p?.transactionFee) || 0
      const refund = Number(p?.refundAmount) || 0
      return sum + (amount - fee - refund)
    }, 0)

    // ===============================
    // 🔥 FORMAT PAYMENTS (ENHANCED)
    // ===============================
    const formattedPayments = payments.map(p => ({
      amount: Number(p?.amount) || 0,
      transactionFee: Number(p?.transactionFee) || 0,
      netAmount:
        (Number(p?.amount) || 0) -
        (Number(p?.transactionFee) || 0),
      refundAmount: Number(p?.refundAmount) || 0,
      paymentMode: p?.paymentMode || "N/A",
      paymentDate: p?.paymentDate || null
    }))

    // ===============================
    // 📩 SEND EMAIL
    // ===============================
    try {
      await sendInvoiceEmail(email, {
        guestName: tour.guestName || "Guest",
        tourId,

        // ✅ Base Amount
        totalAmount: Number(tour.totalCost) || 0,

        // ✅ Payment Summary
        paidAmount,
        netReceived,
        transactionFee: totalTransactionFee,

        payments: formattedPayments,

        // ✅ Breakdown
        activities: formattedActivities,
        additionalCosts: formattedCosts,

        // ✅ Dates
        startDate: formatDate(tour.startDate),
        endDate: formatDate(tour.endDate)
      })
    } catch (emailError) {
      console.error("❌ Email Error:", emailError)

      return res.status(500).json({
        success: false,
        message: "Invoice generated but email sending failed"
      })
    }

    // ===============================
    // ✅ SUCCESS
    // ===============================
    return res.json({
      success: true,
      message: "Invoice sent successfully"
    })

  } catch (error) {
    console.error("❌ Controller Error:", error)

    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending invoice"
    })
  }
}