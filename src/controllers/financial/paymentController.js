import prisma from "../../config/prisma.js";
import { sendInvoiceEmail } from "../../utils/sendInvoiceEmail.js";

/* ------------------------------------------------------ */
/* HELPER FUNCTIONS */
/* ------------------------------------------------------ */

// 🔥 FIXED: Only Card pe fee lagegi
const calculateTransactionFee = (amount, paymentMode) => {
  if (!amount) return 0;

  if (paymentMode !== "Card") return 0;

  return parseFloat((amount * 0.0350).toFixed(2));
};

const calculateStatus = (tourCost, totalReceived, totalRefund) => {
  const netReceived = totalReceived - totalRefund;

  if (totalRefund > 0) return "REFUNDED";
  if (netReceived === 0) return "PENDING";
  if (netReceived < tourCost) return "PARTIAL";
  if (netReceived >= tourCost) return "PAID";

  return "PENDING";
};

/* ------------------------------------------------------ */
/* GET TOUR PAYMENTS */
/* ------------------------------------------------------ */

export const getTourPayments = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Tour ID is required"
      });
    }

    const tour = await prisma.tour.findUnique({
      where: { id },
      select: {
        id: true,
        guestName: true,
        tourName: true,
        totalCost: true
      }
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found"
      });
    }

    const payments = await prisma.payment.findMany({
      where: { tourId: id },
      orderBy: { paymentDate: "desc" }
    });

    const totalReceived = payments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    const totalRefund = payments.reduce(
      (sum, p) => sum + (p.refundAmount || 0),
      0
    );

    const totalFees = payments.reduce(
      (sum, p) => sum + (p.transactionFee || 0),
      0
    );

    const netReceived = totalReceived - totalRefund;

    const pendingAmount = tour.totalCost - netReceived;

    const status = calculateStatus(
      tour.totalCost,
      totalReceived,
      totalRefund
    );

    const lastPaymentDate = payments.length
      ? payments[0].paymentDate
      : null;

    res.json({
      success: true,
      tour,
      summary: {
        totalCost: tour.totalCost || 0,
        receivedAmount: totalReceived,
        refundedAmount: totalRefund,
        netReceived,
        pendingAmount: pendingAmount < 0 ? 0 : pendingAmount,
        transactionFees: totalFees,
        status,
        lastPaymentDate
      },
      payments
    });

  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------ */
/* CREATE PAYMENT */
/* ------------------------------------------------------ */

export const createPayment = async (req, res, next) => {
  try {
    const {
      tourId,
      paymentDate,
      amount,
      paymentMode,
      comment
    } = req.body;

    if (!tourId) {
      return res.status(400).json({
        success: false,
        message: "tourId is required"
      });
    }

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: { payments: true }
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found"
      });
    }

    const parsedAmount = parseFloat(amount || 0);

    // 🔥 FIX: Mode based fee
    const finalMode = paymentMode || "N/A";
    const fee = calculateTransactionFee(parsedAmount, finalMode);

    const payment = await prisma.payment.create({
      data: {
        tourId,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        amount: parsedAmount,
        transactionFee: fee,
        paymentMode: finalMode,
        comment: comment || "N/A",
        status: "PARTIAL"
      }
    });

    // 🔥 Always fetch fresh data
    const allPayments = await prisma.payment.findMany({
      where: { tourId },
      orderBy: { paymentDate: "desc" }
    });

    const totalReceived = allPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    const totalRefund = allPayments.reduce(
      (sum, p) => sum + (p.refundAmount || 0),
      0
    );

    const netReceived = totalReceived - totalRefund;

    const totalAmount = tour.totalCost || 0;
    const remainingAmount = totalAmount - netReceived;

    const status =
      remainingAmount <= 0
        ? "PAID"
        : netReceived > 0
        ? "PARTIAL"
        : "PENDING";

    const formattedPayments = allPayments.map(p => ({
      ...p,
      status: p.refundAmount
        ? "REFUNDED"
        : p.amount > 0
        ? "SUCCESS"
        : "PENDING"
    }));

    try {
      await sendInvoiceEmail(tour.email, {
        guestName: tour.guestName,
        tourId,
        totalAmount,
        paidAmount: netReceived,
        remainingAmount,
        status,
        payments: formattedPayments
      });
    } catch (emailError) {
      console.error("Invoice email failed:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Payment added & invoice sent successfully",
      payment
    });

  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------ */
/* UPDATE PAYMENT */
/* ------------------------------------------------------ */

export const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      paymentDate,
      amount,
      paymentMode,
      comment
    } = req.body;

    const existing = await prisma.payment.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    const parsedAmount = amount ? parseFloat(amount) : existing.amount;

    // 🔥 FIX: Mode based fee
    const finalMode = paymentMode || existing.paymentMode;
    const fee = calculateTransactionFee(parsedAmount, finalMode);

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        paymentDate: paymentDate
          ? new Date(paymentDate)
          : existing.paymentDate,
        amount: parsedAmount,
        transactionFee: fee,
        paymentMode: finalMode,
        comment: comment || existing.comment
      }
    });

    res.json({
      success: true,
      message: "Payment updated successfully",
      payment
    });

  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------ */
/* REFUND PAYMENT */
/* ------------------------------------------------------ */

export const refundPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    if (payment.refundAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment already refunded"
      });
    }

    const refundAmount =
      (payment.amount || 0) - (payment.transactionFee || 0);

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        refundAmount,
        refundDate: new Date(),
        refundReason: "Tour cancelled",
        status: "REFUNDED"
      }
    });

    res.json({
      success: true,
      message: "Refund processed successfully",
      refundAmount,
      payment: updated
    });

  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------ */
/* DELETE PAYMENT */
/* ------------------------------------------------------ */

export const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.payment.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    await prisma.payment.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: "Payment deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------ */
/* ADVISOR RECENT PAYMENTS */
/* ------------------------------------------------------ */

export const getAdvisorRecentPayments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tours = await prisma.tour.findMany({
      where: { advisorId: id },
      select: {
        id: true,
        guestName: true,
        tourName: true,
        totalCost: true
      }
    });

    if (!tours.length) {
      return res.json({ success: true, payments: [] });
    }

    const tourIds = tours.map(t => t.id);

    const payments = await prisma.payment.findMany({
      where: {
        tourId: { in: tourIds }
      },
      orderBy: {
        paymentDate: "desc"
      },
      take: 4
    });

    const enriched = payments.map(p => {
      const tour = tours.find(t => t.id === p.tourId);

      let status = "PENDING";

      if (p.refundAmount) status = "REFUNDED";
      else if (p.amount >= (tour?.totalCost || 0)) status = "PAID";
      else if (p.amount > 0) status = "PARTIAL";

      return {
        id: p.id,
        amount: p.amount,
        paymentDate: p.paymentDate,
        status,
        guestName: tour?.guestName || "N/A",
        tourName: tour?.tourName || "N/A",
        tourId: p.tourId
      };
    });

    res.json({
      success: true,
      payments: enriched
    });

  } catch (error) {
    next(error);
  }
};