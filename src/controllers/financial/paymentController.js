import prisma from "../../config/prisma.js";
import { sendInvoiceEmail } from "../../utils/sendInvoiceEmail.js";
import { createActivityAndEmit } from "../../utils/activityHelper.js";

/* ------------------------------------------------------ */
/* HELPER FUNCTIONS */
/* ------------------------------------------------------ */

const toNumber = (val) => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

const calculateTransactionFee = (amount, paymentMode) => {
  const amt = toNumber(amount);
  if (!amt) return 0;

  // ✅ ONLY Card/Razorpay pe fee lage
  if (paymentMode !== "Card/Razorpay") return 0;

  return Number((amt * 0.035).toFixed(2));
};

const calculateStatus = (tourCost, netReceived) => {
  if (netReceived <= 0) return "PENDING";
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

    // ✅ SAFE CALCULATIONS
    const totalReceived = payments.reduce(
      (sum, p) => sum + toNumber(p.amount),
      0
    );

    const totalRefund = payments.reduce(
      (sum, p) => sum + toNumber(p.refundAmount),
      0
    );

    const totalFees = payments.reduce(
      (sum, p) => sum + toNumber(p.transactionFee),
      0
    );

    const netReceived = totalReceived - totalRefund - totalFees;

    const pendingAmount = Math.max(
      toNumber(tour.totalCost) - netReceived,
      0
    );

    const status = calculateStatus(
      toNumber(tour.totalCost),
      netReceived
    );

    const lastPaymentDate = payments.length
      ? payments[0].paymentDate
      : null;

    res.json({
      success: true,
      tour,
      summary: {
        totalCost: toNumber(tour.totalCost),
        receivedAmount: totalReceived,
        refundedAmount: totalRefund,
        netReceived,
        pendingAmount,
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

    const parsedAmount = toNumber(amount);

    if (!parsedAmount) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

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

    await createActivityAndEmit({
      type: "payment",
      message: `Payment of ₹${parsedAmount} received`,
      tourId,
      performedBy: "Client",
    });

    // 🔥 RECALCULATE AFTER INSERT
    const allPayments = await prisma.payment.findMany({
      where: { tourId },
      orderBy: { paymentDate: "desc" }
    });

    const totalReceived = allPayments.reduce(
      (sum, p) => sum + toNumber(p.amount),
      0
    );

    const totalRefund = allPayments.reduce(
      (sum, p) => sum + toNumber(p.refundAmount),
      0
    );

    const totalFees = allPayments.reduce(
      (sum, p) => sum + toNumber(p.transactionFee),
      0
    );

    const netReceived = totalReceived - totalRefund - totalFees;

    const totalAmount = toNumber(
      (await prisma.tour.findUnique({
        where: { id: tourId },
        select: { totalCost: true }
      }))?.totalCost
    );

    const remainingAmount = Math.max(totalAmount - netReceived, 0);

    const status = calculateStatus(totalAmount, netReceived);

    const formattedPayments = allPayments.map(p => ({
      ...p,
      status: p.refundAmount
        ? "REFUNDED"
        : p.amount > 0
        ? "SUCCESS"
        : "PENDING"
    }));

    try {
      const tour = await prisma.tour.findUnique({ where: { id: tourId } });

      // ✅ ONLY SEND EMAIL IF EXPLICITLY REQUESTED
      if (req.body.sendEmail === true && tour?.email) {
        await sendInvoiceEmail(tour.email, {
          guestName: tour.guestName,
          tourId,
          totalAmount,
          paidAmount: netReceived,
          remainingAmount,
          status,
          payments: formattedPayments
        });
      }

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

    const parsedAmount = amount ? toNumber(amount) : existing.amount;
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

    await createActivityAndEmit({
      type: "payment",
      message: "Payment updated",
      tourId: existing.tourId,
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

    await createActivityAndEmit({
      type: "payment",
      message: "Payment deleted",
      tourId: existing.tourId,
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