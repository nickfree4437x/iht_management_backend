import prisma from "../../config/prisma.js";
import puppeteer from "puppeteer";
import hotelVoucherTemplate from "../../templates/hotel-voucher/hotelVoucherTemplate.js";

export const downloadAllVouchers = async (req, res, next) => {
  try {
    const { tourId } = req.query;

    // ======================================================
    // 🔥 VALIDATION
    // ======================================================
    if (!tourId) {
      return res.status(400).json({
        success: false,
        message: "Tour ID is required",
      });
    }

    // ======================================================
    // 🔥 FETCH VOUCHERS
    // ======================================================
    const vouchers = await prisma.hotelVoucher.findMany({
      where: {
        tourId,
        NOT: {
          status: "None",
        },
      },
      orderBy: [
        {
          checkIn: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

    // ======================================================
    // 🔥 NO VOUCHERS
    // ======================================================
    if (!vouchers.length) {
      return res.status(404).json({
        success: false,
        message: "No vouchers found",
      });
    }

    // ======================================================
    // 🔥 GENERATE HTML
    // ======================================================
    const html = hotelVoucherTemplate(vouchers);

    // ======================================================
    // 🔥 LAUNCH BROWSER
    // ======================================================
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });

    // ======================================================
    // 🔥 CREATE PAGE
    // ======================================================
    const page = await browser.newPage();

    // ======================================================
    // 🔥 TIMEOUT FIX
    // ======================================================
    page.setDefaultNavigationTimeout(0);

    // ======================================================
    // 🔥 SET HTML
    // ======================================================
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });

    // ======================================================
    // 🔥 GENERATE PDF
    // ======================================================
    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "10px",
        right: "20px",
        bottom: "80px",
        left: "40px",
      },
    });

    // ======================================================
    // 🔥 CLOSE BROWSER
    // ======================================================
    await browser.close();

    // ======================================================
    // 🔥 RESPONSE HEADERS
    // ======================================================
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=hotel-vouchers-${tourId}.pdf`,
    });

    // ======================================================
    // 🔥 SEND PDF
    // ======================================================
    return res.send(pdfBuffer);

  } catch (error) {
    console.log(error);
    next(error);
  }
};